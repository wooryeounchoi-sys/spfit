-- =====================================================================
-- SPFIT 서버 측 데이터 접근 계층 (2/3) - Supabase RPC 함수
-- * React 는 테이블에 직접 접근하지 않고 아래 함수만 호출한다.
-- * 회원 식별은 프론트가 보낸 회원 ID 가 아니라 "세션 토큰"으로 서버에서 판단한다.
-- * 모든 입력은 함수 파라미터(바인딩)로 전달되어 SQL Injection 이 불가능하다.
-- * 함수 단위로 트랜잭션이 보장된다 (예외 발생 시 전체 롤백).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 내부 헬퍼 (anon 실행 권한 없음)
-- ---------------------------------------------------------------------
create or replace function public._hash_token(p_token text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

create or replace function public._issue_token(p_member_id bigint, p_purpose text, p_ttl interval)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  delete from public.member_tokens where member_id = p_member_id and expires_at < now();
  insert into public.member_tokens (token_hash, member_id, purpose, expires_at)
  values (public._hash_token(v_token), p_member_id, p_purpose, now() + p_ttl);
  return v_token;
end;
$$;

/** 토큰으로 회원 ID 확인 (없거나 만료 시 AUTH_REQUIRED 예외) */
create or replace function public._auth_member(p_token text, p_purpose text default 'SESSION')
returns bigint
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_member_id bigint;
begin
  if coalesce(p_token, '') = '' then
    raise exception 'AUTH_REQUIRED';
  end if;
  select t.member_id into v_member_id
    from public.member_tokens t
    join public.members m on m.id = t.member_id
   where t.token_hash = public._hash_token(p_token)
     and t.purpose = p_purpose
     and t.expires_at > now()
     and m.status = 'ACTIVE';
  if v_member_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  return v_member_id;
end;
$$;

/** 토큰이 있으면 회원 ID, 없으면 null (비로그인 조회용) */
create or replace function public._optional_member(p_token text)
returns bigint
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_member_id bigint;
begin
  if coalesce(p_token, '') = '' then
    return null;
  end if;
  select t.member_id into v_member_id
    from public.member_tokens t
    join public.members m on m.id = t.member_id
   where t.token_hash = public._hash_token(p_token)
     and t.purpose = 'SESSION'
     and t.expires_at > now()
     and m.status = 'ACTIVE';
  return v_member_id;
end;
$$;

/** 리뷰 작성자명 마스킹: 김스핏 -> 김*핏 */
create or replace function public._mask_name(p_name text)
returns text
language sql
immutable
as $$
  select case
    when char_length(p_name) <= 1 then p_name
    when char_length(p_name) = 2 then left(p_name, 1) || '*'
    else left(p_name, 1) || repeat('*', char_length(p_name) - 2) || right(p_name, 1)
  end;
$$;

/** 상품 대표 이미지 경로 */
create or replace function public._primary_image(p_product_id bigint)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select i.image_path
    from public.product_images i
   where i.product_id = p_product_id
   order by i.is_primary desc, i.sort_order, i.id
   limit 1;
$$;

/** 상품 카드 목록 JSON (목록/검색/좋아요 공통) */
create or replace function public._product_cards(p_ids bigint[], p_member_id bigint)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id,
           'name', p.name,
           'price', p.base_price,
           'category_id', p.category_id,
           'sale_status', p.sale_status,
           'image_path', public._primary_image(p.id),
           'is_liked', exists (select 1 from public.likes l
                                where l.member_id = p_member_id and l.product_id = p.id),
           'review_count', (select count(*) from public.reviews r where r.product_id = p.id),
           'avg_rating', (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = p.id)
         ) order by array_position(p_ids, p.id)), '[]'::jsonb)
    from public.products p
   where p.id = any (p_ids)
     and p.sale_status <> 'HIDDEN';
$$;

-- ---------------------------------------------------------------------
-- 회원가입 / 로그인 / 계정
-- ---------------------------------------------------------------------
/** 아이디 사용 가능 여부 (true = 사용 가능) */
create or replace function public.check_login_id(p_login_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (select 1 from public.members where lower(login_id) = lower(trim(p_login_id)));
$$;

create or replace function public.sign_up(
  p_login_id   text,
  p_password   text,
  p_name       text,
  p_email      text,
  p_phone      text,
  p_birth_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_member_id bigint;
begin
  p_login_id := trim(coalesce(p_login_id, ''));
  if p_login_id = '' or coalesce(p_password, '') = '' or coalesce(trim(p_name), '') = ''
     or coalesce(trim(p_email), '') = '' or coalesce(trim(p_phone), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'MISSING_FIELD');
  end if;
  if p_login_id !~ '^[A-Za-z0-9_]{4,20}$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID_LOGIN_ID');
  end if;
  if char_length(p_password) < 4 then
    return jsonb_build_object('ok', false, 'error', 'WEAK_PASSWORD');
  end if;
  if trim(p_email) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return jsonb_build_object('ok', false, 'error', 'INVALID_EMAIL');
  end if;
  if not public.check_login_id(p_login_id) then
    return jsonb_build_object('ok', false, 'error', 'DUPLICATE_LOGIN_ID');
  end if;

  insert into public.members (login_id, password_hash, name, email, phone, birth_date)
  values (p_login_id, extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
          trim(p_name), trim(p_email), trim(p_phone), p_birth_date)
  returning id into v_member_id;

  insert into public.carts (member_id) values (v_member_id);
  return jsonb_build_object('ok', true);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'DUPLICATE_LOGIN_ID');
end;
$$;

/** 로그인 결과: NO_MEMBER(가입정보 없음) / WRONG_PASSWORD / OK */
create or replace function public.login(p_login_id text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_member public.members%rowtype;
begin
  select * into v_member from public.members
   where lower(login_id) = lower(trim(coalesce(p_login_id, '')));
  if not found or v_member.status <> 'ACTIVE' then
    return jsonb_build_object('status', 'NO_MEMBER');
  end if;
  if v_member.password_hash <> extensions.crypt(coalesce(p_password, ''), v_member.password_hash) then
    return jsonb_build_object('status', 'WRONG_PASSWORD');
  end if;
  return jsonb_build_object(
    'status', 'OK',
    'token', public._issue_token(v_member.id, 'SESSION', interval '7 days'),
    'member', jsonb_build_object('login_id', v_member.login_id, 'name', v_member.name)
  );
end;
$$;

create or replace function public.logout(p_token text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  delete from public.member_tokens where token_hash = public._hash_token(coalesce(p_token, ''));
$$;

create or replace function public.get_me(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  return (select jsonb_build_object(
            'login_id', login_id, 'name', name, 'email', email,
            'phone', phone, 'birth_date', birth_date)
            from public.members where id = v_member_id);
end;
$$;

/** 아이디 찾기 (이름 + 이메일) */
create or replace function public.find_login_id(p_name text, p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_ids jsonb;
begin
  select jsonb_agg(login_id order by created_at) into v_ids
    from public.members
   where status = 'ACTIVE'
     and name = trim(coalesce(p_name, ''))
     and lower(email) = lower(trim(coalesce(p_email, '')));
  if v_ids is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  return jsonb_build_object('ok', true, 'login_ids', v_ids);
end;
$$;

/**
 * 비밀번호 재설정 1단계: 본인 확인 후 15분짜리 재설정 토큰 발급
 * (기존 비밀번호를 알려주는 기능은 제공하지 않음)
 */
create or replace function public.request_password_reset(p_name text, p_login_id text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_member_id bigint;
begin
  select id into v_member_id
    from public.members
   where status = 'ACTIVE'
     and name = trim(coalesce(p_name, ''))
     and lower(login_id) = lower(trim(coalesce(p_login_id, '')))
     and lower(email) = lower(trim(coalesce(p_email, '')));
  if v_member_id is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  delete from public.member_tokens where member_id = v_member_id and purpose = 'PASSWORD_RESET';
  return jsonb_build_object('ok', true,
    'reset_token', public._issue_token(v_member_id, 'PASSWORD_RESET', interval '15 minutes'));
end;
$$;

/** 비밀번호 재설정 2단계: 새 비밀번호 저장 + 모든 세션 만료 */
create or replace function public.reset_password(p_reset_token text, p_new_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_member_id bigint := public._auth_member(p_reset_token, 'PASSWORD_RESET');
begin
  if char_length(coalesce(p_new_password, '')) < 4 then
    return jsonb_build_object('ok', false, 'error', 'WEAK_PASSWORD');
  end if;
  update public.members
     set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 10))
   where id = v_member_id;
  delete from public.member_tokens where member_id = v_member_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.change_password(p_token text, p_current_password text, p_new_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_hash text;
begin
  select password_hash into v_hash from public.members where id = v_member_id;
  if v_hash <> extensions.crypt(coalesce(p_current_password, ''), v_hash) then
    return jsonb_build_object('ok', false, 'error', 'WRONG_PASSWORD');
  end if;
  if char_length(coalesce(p_new_password, '')) < 4 then
    return jsonb_build_object('ok', false, 'error', 'WEAK_PASSWORD');
  end if;
  update public.members
     set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 10))
   where id = v_member_id;
  -- 현재 세션을 제외한 다른 세션은 만료
  delete from public.member_tokens
   where member_id = v_member_id and token_hash <> public._hash_token(p_token);
  return jsonb_build_object('ok', true);
end;
$$;

/** 회원 탈퇴: 주문 기록 보존을 위해 status 만 WITHDRAWN 으로 변경 */
create or replace function public.withdraw_member(p_token text, p_login_id text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_member public.members%rowtype;
begin
  select * into v_member from public.members where id = v_member_id;
  if lower(v_member.login_id) <> lower(trim(coalesce(p_login_id, '')))
     or v_member.password_hash <> extensions.crypt(coalesce(p_password, ''), v_member.password_hash) then
    return jsonb_build_object('ok', false, 'error', 'MISMATCH');
  end if;
  update public.members set status = 'WITHDRAWN' where id = v_member_id;
  delete from public.member_tokens where member_id = v_member_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------
-- 카테고리 / 상품 조회
-- ---------------------------------------------------------------------
create or replace function public.get_categories()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', id, 'parent_id', parent_id, 'name', name, 'depth', depth, 'sort_order', sort_order)
           order by depth, sort_order, id), '[]'::jsonb)
    from public.categories;
$$;

/** 카테고리(상위/하위/최하위 모두 가능)의 하위 전체 상품 조회 */
create or replace function public.get_products(p_category_id bigint, p_token text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_ids bigint[];
begin
  with recursive tree as (
    select id from public.categories where id = p_category_id
    union all
    select c.id from public.categories c join tree t on c.parent_id = t.id
  )
  select array_agg(p.id order by p.id) into v_ids
    from public.products p
   where p.category_id in (select id from tree)
     and p.sale_status <> 'HIDDEN';
  return public._product_cards(coalesce(v_ids, '{}'), public._optional_member(p_token));
end;
$$;

create or replace function public.search_products(p_keyword text, p_token text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_keyword text := trim(coalesce(p_keyword, ''));
  v_ids bigint[];
begin
  if v_keyword = '' then
    return '[]'::jsonb;
  end if;
  v_keyword := replace(replace(replace(v_keyword, '\', '\\'), '%', '\%'), '_', '\_');
  select array_agg(p.id order by p.id) into v_ids
    from public.products p
    join public.categories c on c.id = p.category_id
   where p.sale_status <> 'HIDDEN'
     and (p.name ilike '%' || v_keyword || '%' or c.name ilike '%' || v_keyword || '%');
  return public._product_cards(coalesce(v_ids, '{}'), public._optional_member(p_token));
end;
$$;

create or replace function public.get_product_detail(p_product_id bigint, p_token text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._optional_member(p_token);
  v_product public.products%rowtype;
  v_path jsonb;
begin
  select * into v_product from public.products where id = p_product_id and sale_status <> 'HIDDEN';
  if not found then
    return null;
  end if;

  with recursive anc as (
    select id, parent_id, name, depth from public.categories where id = v_product.category_id
    union all
    select c.id, c.parent_id, c.name, c.depth from public.categories c join anc a on c.id = a.parent_id
  )
  select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by depth) into v_path from anc;

  return jsonb_build_object(
    'id', v_product.id,
    'name', v_product.name,
    'description', v_product.description,
    'price', v_product.base_price,
    'sale_status', v_product.sale_status,
    'category_id', v_product.category_id,
    'category_path', v_path,
    'images', (select coalesce(jsonb_agg(jsonb_build_object(
                        'image_path', image_path, 'image_type', image_type, 'is_primary', is_primary)
                        order by is_primary desc, sort_order, id), '[]'::jsonb)
                 from public.product_images where product_id = v_product.id),
    'options', (select coalesce(jsonb_agg(jsonb_build_object(
                         'id', o.id, 'color', o.color, 'size', o.size,
                         'price', v_product.base_price + o.extra_price, 'stock', o.stock)
                         order by o.sort_order, o.id), '[]'::jsonb)
                  from public.product_options o
                 where o.product_id = v_product.id and o.is_active),
    'is_liked', exists (select 1 from public.likes
                         where member_id = v_member_id and product_id = v_product.id),
    'review_count', (select count(*) from public.reviews where product_id = v_product.id)
  );
end;
$$;

/** 상품 리뷰 요약(평균/별점별 개수) + 리뷰 목록 */
create or replace function public.get_product_reviews(p_product_id bigint, p_token text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._optional_member(p_token);
begin
  return jsonb_build_object(
    'average', (select coalesce(round(avg(rating)::numeric, 1), 0)
                  from public.reviews where product_id = p_product_id),
    'total', (select count(*) from public.reviews where product_id = p_product_id),
    'distribution', (select jsonb_agg(jsonb_build_object(
                              'rating', l.rating, 'label', l.label,
                              'count', (select count(*) from public.reviews r
                                         where r.product_id = p_product_id and r.rating = l.rating))
                              order by l.rating desc)
                       from public.review_rating_labels l),
    'reviews', (select coalesce(jsonb_agg(jsonb_build_object(
                         'id', r.id,
                         'rating', r.rating,
                         'content', r.content,
                         'image_path', r.image_path,
                         'created_at', r.created_at,
                         'writer_name', public._mask_name(m.name),
                         'color', oi.color,
                         'size', oi.size,
                         'product_name', oi.product_name,
                         'is_mine', r.member_id = v_member_id)
                         order by r.created_at desc), '[]'::jsonb)
                  from public.reviews r
                  join public.members m on m.id = r.member_id
                  join public.order_items oi on oi.id = r.order_item_id
                 where r.product_id = p_product_id)
  );
end;
$$;

/** 메인 페이지 콘텐츠 (배너, Style Magazine, Check Your Shoes, 최신 리뷰) */
create or replace function public.get_main_contents()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'banners', (select coalesce(jsonb_agg(jsonb_build_object(
                         'id', b.id, 'banner_type', b.banner_type, 'image_path', b.image_path,
                         'headline', b.headline, 'sub_headline', b.sub_headline,
                         'button_label', b.button_label, 'link_product_id', b.link_product_id,
                         'link_category_id', b.link_category_id,
                         'link_product_category_id', lp.category_id)
                         order by b.sort_order, b.id), '[]'::jsonb)
                  from public.banners b
                  left join public.products lp on lp.id = b.link_product_id
                 where b.is_active),
    'magazines', (select coalesce(jsonb_agg(jsonb_build_object(
                           'id', s.id, 'image_path', s.image_path,
                           'items', (select coalesce(jsonb_agg(jsonb_build_object(
                                              'slot', i.slot, 'product_id', p.id, 'category_id', p.category_id,
                                              'name', p.name, 'price', p.base_price)
                                              order by array_position(array['TOP', 'BOTTOM', 'SHOES']::varchar[], i.slot)),
                                            '[]'::jsonb)
                                       from public.style_magazine_items i
                                       join public.products p on p.id = i.product_id
                                      where i.magazine_id = s.id and p.sale_status <> 'HIDDEN'))
                           order by s.sort_order, s.id), '[]'::jsonb)
                    from public.style_magazines s
                   where s.is_active),
    'shoe_guides', (select coalesce(jsonb_agg(jsonb_build_object(
                             'id', g.id, 'title', g.title, 'representative_label', g.representative_label,
                             'product_id', g.product_id, 'product_name', p.name,
                             'category_id', g.category_id, 'target_pace', g.target_pace,
                             'recommended_for', g.recommended_for, 'image_path', g.image_path)
                             order by g.sort_order, g.id), '[]'::jsonb)
                      from public.shoe_guides g
                      left join public.products p on p.id = g.product_id
                     where g.is_active),
    'recent_reviews', (select coalesce(jsonb_agg(x.obj order by x.created_at desc), '[]'::jsonb)
                         from (select r.created_at, jsonb_build_object(
                                        'id', r.id, 'rating', r.rating, 'content', r.content,
                                        'image_path', r.image_path, 'writer_name', public._mask_name(m.name),
                                        'product_id', p.id, 'product_name', p.name, 'category_id', p.category_id,
                                        'created_at', r.created_at) as obj
                                 from public.reviews r
                                 join public.members m on m.id = r.member_id
                                 join public.products p on p.id = r.product_id
                                where p.sale_status <> 'HIDDEN'
                                order by (r.image_path is not null) desc, r.created_at desc
                                limit 4) x)
  );
$$;

-- ---------------------------------------------------------------------
-- 좋아요
-- ---------------------------------------------------------------------
create or replace function public.toggle_like(p_token text, p_product_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  if not exists (select 1 from public.products where id = p_product_id and sale_status <> 'HIDDEN') then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;
  delete from public.likes where member_id = v_member_id and product_id = p_product_id;
  if found then
    return jsonb_build_object('is_liked', false);
  end if;
  insert into public.likes (member_id, product_id) values (v_member_id, p_product_id);
  return jsonb_build_object('is_liked', true);
end;
$$;

create or replace function public.get_liked_products(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_ids bigint[];
begin
  select array_agg(product_id order by created_at desc) into v_ids
    from public.likes where member_id = v_member_id;
  return public._product_cards(coalesce(v_ids, '{}'), v_member_id);
end;
$$;

-- ---------------------------------------------------------------------
-- 장바구니
-- ---------------------------------------------------------------------
create or replace function public._member_cart(p_member_id bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_id bigint;
begin
  select id into v_cart_id from public.carts where member_id = p_member_id;
  if v_cart_id is null then
    insert into public.carts (member_id) values (p_member_id) returning id into v_cart_id;
  end if;
  return v_cart_id;
end;
$$;

create or replace function public.get_cart(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  return (select coalesce(jsonb_agg(jsonb_build_object(
                   'cart_item_id', ci.id,
                   'option_id', o.id,
                   'product_id', p.id,
                   'category_id', p.category_id,
                   'product_name', p.name,
                   'color', o.color,
                   'size', o.size,
                   'unit_price', p.base_price + o.extra_price,
                   'quantity', ci.quantity,
                   'stock', o.stock,
                   'image_path', public._primary_image(p.id),
                   'is_available', o.is_active and p.sale_status = 'ON_SALE' and o.stock >= ci.quantity)
                   order by ci.created_at desc, ci.id desc), '[]'::jsonb)
            from public.carts c
            join public.cart_items ci on ci.cart_id = c.id
            join public.product_options o on o.id = ci.option_id
            join public.products p on p.id = o.product_id
           where c.member_id = v_member_id);
end;
$$;

create or replace function public.add_to_cart(p_token text, p_option_id bigint, p_quantity integer default 1)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_cart_id bigint;
  v_stock integer;
  v_new_qty integer;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 99 then
    raise exception 'INVALID_QUANTITY';
  end if;
  select o.stock into v_stock
    from public.product_options o
    join public.products p on p.id = o.product_id
   where o.id = p_option_id and o.is_active and p.sale_status = 'ON_SALE';
  if v_stock is null then
    raise exception 'OPTION_NOT_AVAILABLE';
  end if;

  v_cart_id := public._member_cart(v_member_id);
  select coalesce((select quantity from public.cart_items
                    where cart_id = v_cart_id and option_id = p_option_id), 0) + p_quantity
    into v_new_qty;
  if v_new_qty > 99 then
    raise exception 'INVALID_QUANTITY';
  end if;
  if v_new_qty > v_stock then
    raise exception 'OUT_OF_STOCK';
  end if;

  insert into public.cart_items (cart_id, option_id, quantity)
  values (v_cart_id, p_option_id, p_quantity)
  on conflict (cart_id, option_id)
  do update set quantity = excluded.quantity + public.cart_items.quantity;
  return jsonb_build_object('ok', true, 'quantity', v_new_qty);
end;
$$;

create or replace function public.update_cart_item(p_token text, p_cart_item_id bigint, p_quantity integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_stock integer;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 99 then
    raise exception 'INVALID_QUANTITY';
  end if;
  select o.stock into v_stock
    from public.cart_items ci
    join public.carts c on c.id = ci.cart_id
    join public.product_options o on o.id = ci.option_id
   where ci.id = p_cart_item_id and c.member_id = v_member_id;
  if v_stock is null then
    raise exception 'NOT_FOUND';
  end if;
  if p_quantity > v_stock then
    raise exception 'OUT_OF_STOCK';
  end if;
  update public.cart_items set quantity = p_quantity where id = p_cart_item_id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.remove_cart_item(p_token text, p_cart_item_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  delete from public.cart_items ci
   using public.carts c
   where c.id = ci.cart_id and c.member_id = v_member_id and ci.id = p_cart_item_id;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------
-- 배송지
-- ---------------------------------------------------------------------
create or replace function public.get_addresses(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  return (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', id, 'address_name', address_name, 'road_address', road_address,
                   'detail_address', detail_address, 'is_default', is_default)
                   order by is_default desc, created_at), '[]'::jsonb)
            from public.addresses where member_id = v_member_id);
end;
$$;

create or replace function public.add_address(
  p_token          text,
  p_road_address   text,
  p_detail_address text,
  p_address_name   text default '배송지',
  p_is_default     boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_is_default boolean := coalesce(p_is_default, false);
  v_id bigint;
begin
  if coalesce(trim(p_road_address), '') = '' then
    raise exception 'MISSING_ROAD_ADDRESS';
  end if;
  if not exists (select 1 from public.addresses where member_id = v_member_id) then
    v_is_default := true;   -- 첫 배송지는 기본 배송지
  end if;
  if v_is_default then
    update public.addresses set is_default = false where member_id = v_member_id and is_default;
  end if;
  insert into public.addresses (member_id, address_name, road_address, detail_address, is_default)
  values (v_member_id, coalesce(nullif(trim(p_address_name), ''), '배송지'),
          trim(p_road_address), trim(coalesce(p_detail_address, '')), v_is_default)
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

create or replace function public.update_address(
  p_token          text,
  p_address_id     bigint,
  p_road_address   text,
  p_detail_address text,
  p_address_name   text default '배송지'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  if coalesce(trim(p_road_address), '') = '' then
    raise exception 'MISSING_ROAD_ADDRESS';
  end if;
  update public.addresses
     set road_address = trim(p_road_address),
         detail_address = trim(coalesce(p_detail_address, '')),
         address_name = coalesce(nullif(trim(p_address_name), ''), '배송지')
   where id = p_address_id and member_id = v_member_id;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.delete_address(p_token text, p_address_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_was_default boolean;
begin
  delete from public.addresses
   where id = p_address_id and member_id = v_member_id
  returning is_default into v_was_default;
  if v_was_default is null then
    raise exception 'NOT_FOUND';
  end if;
  if v_was_default then
    update public.addresses set is_default = true
     where id = (select id from public.addresses where member_id = v_member_id
                  order by created_at desc limit 1);
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.set_default_address(p_token text, p_address_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  if not exists (select 1 from public.addresses where id = p_address_id and member_id = v_member_id) then
    raise exception 'NOT_FOUND';
  end if;
  update public.addresses set is_default = false where member_id = v_member_id and is_default;
  update public.addresses set is_default = true where id = p_address_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------
-- 주문
-- ---------------------------------------------------------------------
/**
 * 주문 생성 (하나의 트랜잭션)
 * p_items: [{"option_id": 1, "quantity": 2}, ...]
 * 가격/재고는 프론트 값이 아닌 DB 값으로 검증·계산하고, 재고는 행 잠금 후 차감한다.
 */
create or replace function public.create_order(
  p_token          text,
  p_items          jsonb,
  p_address_id     bigint,
  p_payment_method text,
  p_cart_item_ids  bigint[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_member public.members%rowtype;
  v_address public.addresses%rowtype;
  v_order_id bigint;
  v_order_number text;
  v_line record;
  v_total_qty integer := 0;
  v_total_amount integer := 0;
  v_count integer;
begin
  if p_payment_method is null or p_payment_method not in ('GENERAL', 'EASY') then
    raise exception 'INVALID_PAYMENT_METHOD';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ORDER';
  end if;

  select * into v_member from public.members where id = v_member_id;
  select * into v_address from public.addresses where id = p_address_id and member_id = v_member_id;
  if not found then
    raise exception 'ADDRESS_REQUIRED';
  end if;

  -- 요청 항목 정리 (같은 옵션은 합산)
  create temp table if not exists _order_req (option_id bigint primary key, quantity integer) on commit drop;
  truncate _order_req;
  insert into _order_req (option_id, quantity)
  select (e ->> 'option_id')::bigint, sum((e ->> 'quantity')::integer)
    from jsonb_array_elements(p_items) e
   group by 1;

  if exists (select 1 from _order_req where option_id is null or quantity is null or quantity < 1 or quantity > 99) then
    raise exception 'INVALID_QUANTITY';
  end if;

  -- 옵션 행 잠금 + 판매/재고 검증
  select count(*) into v_count
    from public.product_options o
    join _order_req r on r.option_id = o.id
    join public.products p on p.id = o.product_id
   where o.is_active and p.sale_status = 'ON_SALE';
  if v_count <> (select count(*) from _order_req) then
    raise exception 'OPTION_NOT_AVAILABLE';
  end if;

  perform 1 from public.product_options o join _order_req r on r.option_id = o.id
   order by o.id for update of o;

  if exists (select 1 from public.product_options o join _order_req r on r.option_id = o.id
              where o.stock < r.quantity) then
    raise exception 'OUT_OF_STOCK';
  end if;

  select sum(r.quantity), sum((p.base_price + o.extra_price) * r.quantity)
    into v_total_qty, v_total_amount
    from _order_req r
    join public.product_options o on o.id = r.option_id
    join public.products p on p.id = o.product_id;

  v_order_number := 'SP' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');

  insert into public.orders (member_id, order_number, recipient_name, ship_road_address, ship_detail_address,
                             total_quantity, total_amount, payment_method)
  values (v_member_id, v_order_number, v_member.name, v_address.road_address, v_address.detail_address,
          v_total_qty, v_total_amount, p_payment_method)
  returning id into v_order_id;

  for v_line in
    select o.id as option_id, p.id as product_id, p.name, o.color, o.size,
           p.base_price + o.extra_price as unit_price, r.quantity
      from _order_req r
      join public.product_options o on o.id = r.option_id
      join public.products p on p.id = o.product_id
     order by o.id
  loop
    insert into public.order_items (order_id, product_id, option_id, product_name, color, size,
                                    unit_price, image_path, quantity, line_total)
    values (v_order_id, v_line.product_id, v_line.option_id, v_line.name, v_line.color, v_line.size,
            v_line.unit_price, public._primary_image(v_line.product_id), v_line.quantity,
            v_line.unit_price * v_line.quantity);

    update public.product_options set stock = stock - v_line.quantity where id = v_line.option_id;
  end loop;

  -- 장바구니에서 구매한 항목 제거 (본인 장바구니만)
  if p_cart_item_ids is not null then
    delete from public.cart_items ci
     using public.carts c
     where c.id = ci.cart_id and c.member_id = v_member_id and ci.id = any (p_cart_item_ids);
  end if;

  return jsonb_build_object('ok', true, 'order_id', v_order_id, 'order_number', v_order_number,
                            'total_amount', v_total_amount, 'total_quantity', v_total_qty,
                            'recipient_name', v_member.name);
end;
$$;

/** 구매 내역 (배송 상태 포함, 주문 단위) */
create or replace function public.get_orders(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  return (select coalesce(jsonb_agg(jsonb_build_object(
                   'order_id', o.id,
                   'order_number', o.order_number,
                   'ordered_at', o.ordered_at,
                   'order_status', o.order_status,
                   'delivery_status', o.delivery_status,
                   'payment_method', o.payment_method,
                   'total_amount', o.total_amount,
                   'total_quantity', o.total_quantity,
                   'items', (select coalesce(jsonb_agg(jsonb_build_object(
                                      'order_item_id', oi.id,
                                      'product_id', oi.product_id,
                                      'category_id', p.category_id,
                                      'product_name', oi.product_name,
                                      'color', oi.color,
                                      'size', oi.size,
                                      'unit_price', oi.unit_price,
                                      'quantity', oi.quantity,
                                      'line_total', oi.line_total,
                                      'image_path', oi.image_path,
                                      'review_id', rv.id)
                                      order by oi.id), '[]'::jsonb)
                               from public.order_items oi
                               left join public.products p on p.id = oi.product_id
                               left join public.reviews rv on rv.order_item_id = oi.id
                              where oi.order_id = o.id))
                   order by o.ordered_at desc, o.id desc), '[]'::jsonb)
            from public.orders o
           where o.member_id = v_member_id);
end;
$$;

create or replace function public.has_purchased(p_token text, p_product_id bigint)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  return exists (select 1 from public.order_items oi
                   join public.orders o on o.id = oi.order_id
                  where o.member_id = v_member_id and o.order_status = 'PAID'
                    and oi.product_id = p_product_id);
end;
$$;

-- ---------------------------------------------------------------------
-- 리뷰
-- ---------------------------------------------------------------------
create or replace function public.create_review(p_token text, p_order_item_id bigint, p_rating integer, p_content text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
  v_product_id bigint;
  v_id bigint;
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'INVALID_RATING';
  end if;
  if coalesce(trim(p_content), '') = '' then
    raise exception 'EMPTY_CONTENT';
  end if;
  select oi.product_id into v_product_id
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
   where oi.id = p_order_item_id and o.member_id = v_member_id and o.order_status = 'PAID';
  if v_product_id is null then
    raise exception 'REVIEW_NOT_PURCHASED';
  end if;
  if exists (select 1 from public.reviews where order_item_id = p_order_item_id) then
    raise exception 'ALREADY_REVIEWED';
  end if;
  insert into public.reviews (member_id, product_id, order_item_id, rating, content)
  values (v_member_id, v_product_id, p_order_item_id, p_rating, trim(p_content))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

create or replace function public.update_review(p_token text, p_review_id bigint, p_rating integer, p_content text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'INVALID_RATING';
  end if;
  if coalesce(trim(p_content), '') = '' then
    raise exception 'EMPTY_CONTENT';
  end if;
  update public.reviews set rating = p_rating, content = trim(p_content)
   where id = p_review_id and member_id = v_member_id;
  if not found then
    raise exception 'FORBIDDEN';
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.delete_review(p_token text, p_review_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  delete from public.reviews where id = p_review_id and member_id = v_member_id;
  if not found then
    raise exception 'FORBIDDEN';
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.get_my_reviews(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_member_id bigint := public._auth_member(p_token);
begin
  return (select coalesce(jsonb_agg(jsonb_build_object(
                   'id', r.id,
                   'product_id', r.product_id,
                   'category_id', p.category_id,
                   'product_name', oi.product_name,
                   'color', oi.color,
                   'size', oi.size,
                   'rating', r.rating,
                   'content', r.content,
                   'image_path', r.image_path,
                   'writer_name', m.name,
                   'created_at', r.created_at)
                   order by r.created_at desc), '[]'::jsonb)
            from public.reviews r
            join public.members m on m.id = r.member_id
            join public.order_items oi on oi.id = r.order_item_id
            join public.products p on p.id = r.product_id
           where r.member_id = v_member_id);
end;
$$;

-- ---------------------------------------------------------------------
-- 실행 권한: 내부 헬퍼는 차단, 공개 API 함수만 anon/authenticated 에 허용
-- ---------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function
  public.check_login_id(text),
  public.sign_up(text, text, text, text, text, date),
  public.login(text, text),
  public.logout(text),
  public.get_me(text),
  public.find_login_id(text, text),
  public.request_password_reset(text, text, text),
  public.reset_password(text, text),
  public.change_password(text, text, text),
  public.withdraw_member(text, text, text),
  public.get_categories(),
  public.get_products(bigint, text),
  public.search_products(text, text),
  public.get_product_detail(bigint, text),
  public.get_product_reviews(bigint, text),
  public.get_main_contents(),
  public.toggle_like(text, bigint),
  public.get_liked_products(text),
  public.get_cart(text),
  public.add_to_cart(text, bigint, integer),
  public.update_cart_item(text, bigint, integer),
  public.remove_cart_item(text, bigint),
  public.get_addresses(text),
  public.add_address(text, text, text, text, boolean),
  public.update_address(text, bigint, text, text, text),
  public.delete_address(text, bigint),
  public.set_default_address(text, bigint),
  public.create_order(text, jsonb, bigint, text, bigint[]),
  public.get_orders(text),
  public.has_purchased(text, bigint),
  public.create_review(text, bigint, integer, text),
  public.update_review(text, bigint, integer, text),
  public.delete_review(text, bigint),
  public.get_my_reviews(text)
to anon, authenticated;
