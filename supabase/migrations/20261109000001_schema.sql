-- =====================================================================
-- SPFIT 쇼핑몰 데이터베이스 스키마 (1/3)
-- 실행 순서: 1) schema  2) functions  3) seed
-- 원칙: 페이지 고유 이름(mn1, pd_1 ...)과 무관하게 "실제 데이터" 기준으로 설계
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

/** 공통: updated_at 자동 갱신 트리거 함수 */
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- ① 회원 및 계정
-- ---------------------------------------------------------------------
create table public.members (
  id            bigint generated always as identity primary key,
  login_id      varchar(20)  not null,
  password_hash text         not null,                 -- bcrypt 해시 (평문 저장 금지)
  name          varchar(50)  not null,
  email         varchar(254) not null,
  phone         varchar(20)  not null,
  birth_date    date,
  status        varchar(10)  not null default 'ACTIVE',
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),
  constraint members_status_check   check (status in ('ACTIVE', 'WITHDRAWN')),
  constraint members_login_id_check check (login_id ~ '^[A-Za-z0-9_]{4,20}$'),
  constraint members_email_check    check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);
-- 아이디 중복 방지 (대소문자 구분 없이)
create unique index members_login_id_key on public.members (lower(login_id));
create index members_name_email_idx on public.members (name, lower(email));

create trigger members_set_updated_at before update on public.members
  for each row execute function public.set_updated_at();

/** 로그인 세션 / 비밀번호 재설정 토큰 (토큰 원문은 저장하지 않고 SHA-256 해시만 저장) */
create table public.member_tokens (
  token_hash  text        primary key,
  member_id   bigint      not null references public.members (id) on delete cascade,
  purpose     varchar(20) not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  constraint member_tokens_purpose_check check (purpose in ('SESSION', 'PASSWORD_RESET'))
);
create index member_tokens_member_idx on public.member_tokens (member_id, purpose);

-- ---------------------------------------------------------------------
-- ② 카테고리 (계층형: 부모-자식)
-- ---------------------------------------------------------------------
create table public.categories (
  id          bigint generated always as identity primary key,
  parent_id   bigint references public.categories (id) on delete restrict,
  name        varchar(50) not null,
  depth       smallint    not null,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  constraint categories_depth_check check (depth between 1 and 3),
  constraint categories_root_check  check ((parent_id is null) = (depth = 1))
);
create unique index categories_parent_name_key on public.categories (coalesce(parent_id, 0), name);
create index categories_parent_idx on public.categories (parent_id);

/** 부모 depth + 1 = 자식 depth 검증 */
create or replace function public.validate_category_depth()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_parent_depth smallint;
begin
  if new.parent_id is not null then
    select depth into v_parent_depth from public.categories where id = new.parent_id;
    if v_parent_depth is null or new.depth <> v_parent_depth + 1 then
      raise exception 'INVALID_CATEGORY_DEPTH';
    end if;
  end if;
  return new;
end;
$$;

create trigger categories_validate_depth before insert or update on public.categories
  for each row execute function public.validate_category_depth();

-- ---------------------------------------------------------------------
-- ③ 상품 및 옵션
-- ---------------------------------------------------------------------
create table public.products (
  id           bigint generated always as identity primary key,
  category_id  bigint       not null references public.categories (id) on delete restrict,
  name         varchar(100) not null,
  description  text,
  base_price   integer      not null,
  sale_status  varchar(10)  not null default 'ON_SALE',
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now(),
  constraint products_price_check  check (base_price >= 0),
  constraint products_status_check check (sale_status in ('ON_SALE', 'SOLD_OUT', 'HIDDEN'))
);
create index products_category_idx on public.products (category_id);

create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_options (
  id           bigint generated always as identity primary key,
  product_id   bigint      not null references public.products (id) on delete cascade,
  color        varchar(30) not null,
  size         varchar(20) not null,
  extra_price  integer     not null default 0,       -- 옵션 추가금 (최종가 = base_price + extra_price)
  stock        integer     not null default 0,
  is_active    boolean     not null default true,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint product_options_extra_price_check check (extra_price >= 0),
  constraint product_options_stock_check       check (stock >= 0),
  constraint product_options_unique            unique (product_id, color, size)
);

create trigger product_options_set_updated_at before update on public.product_options
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- ④ 상품 이미지 (파일은 정적 경로로 관리, DB 에는 경로만 저장)
-- ---------------------------------------------------------------------
create table public.product_images (
  id          bigint generated always as identity primary key,
  product_id  bigint       not null references public.products (id) on delete cascade,
  image_path  varchar(300) not null,
  image_type  varchar(20)  not null default 'MAIN',
  is_primary  boolean      not null default false,
  sort_order  integer      not null default 0,
  created_at  timestamptz  not null default now(),
  constraint product_images_type_check check (image_type in ('MAIN', 'DETAIL', 'LOOKBOOK'))
);
create index product_images_product_idx on public.product_images (product_id, sort_order);
-- 상품당 대표 이미지는 1개
create unique index product_images_primary_key on public.product_images (product_id) where is_primary;

-- ---------------------------------------------------------------------
-- ⑤ 장바구니
-- ---------------------------------------------------------------------
create table public.carts (
  id          bigint generated always as identity primary key,
  member_id   bigint      not null unique references public.members (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger carts_set_updated_at before update on public.carts
  for each row execute function public.set_updated_at();

create table public.cart_items (
  id          bigint generated always as identity primary key,
  cart_id     bigint      not null references public.carts (id) on delete cascade,
  option_id   bigint      not null references public.product_options (id) on delete cascade,
  quantity    integer     not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint cart_items_quantity_check check (quantity between 1 and 99),
  constraint cart_items_unique         unique (cart_id, option_id)
);

create trigger cart_items_set_updated_at before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- ⑨ 배송지
-- ---------------------------------------------------------------------
create table public.addresses (
  id              bigint generated always as identity primary key,
  member_id       bigint       not null references public.members (id) on delete cascade,
  address_name    varchar(50)  not null default '배송지',
  road_address    varchar(200) not null,
  detail_address  varchar(500) not null default '',
  is_default      boolean      not null default false,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);
create index addresses_member_idx on public.addresses (member_id);
create unique index addresses_default_key on public.addresses (member_id) where is_default;

create trigger addresses_set_updated_at before update on public.addresses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- ⑥ 주문 및 구매 내역 (주문 당시 정보를 스냅샷으로 보존)
-- ---------------------------------------------------------------------
create sequence public.order_number_seq;

create table public.orders (
  id                   bigint generated always as identity primary key,
  member_id            bigint       not null references public.members (id) on delete restrict,
  order_number         varchar(30)  not null unique,
  recipient_name       varchar(50)  not null,
  ship_road_address    varchar(200) not null,
  ship_detail_address  varchar(500) not null default '',
  total_quantity       integer      not null,
  total_amount         integer      not null,
  payment_method       varchar(10)  not null,
  order_status         varchar(10)  not null default 'PAID',
  delivery_status      varchar(10)  not null default 'READY',
  ordered_at           timestamptz  not null default now(),
  updated_at           timestamptz  not null default now(),
  constraint orders_quantity_check check (total_quantity > 0),
  constraint orders_amount_check   check (total_amount >= 0),
  constraint orders_payment_check  check (payment_method in ('GENERAL', 'EASY')),
  constraint orders_status_check   check (order_status in ('PAID', 'CANCELLED')),
  constraint orders_delivery_check check (delivery_status in ('READY', 'SHIPPING', 'DELIVERED'))
);
create index orders_member_idx on public.orders (member_id, ordered_at desc);

create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id            bigint generated always as identity primary key,
  order_id      bigint       not null references public.orders (id) on delete cascade,
  product_id    bigint       references public.products (id) on delete set null,
  option_id     bigint       references public.product_options (id) on delete set null,
  product_name  varchar(100) not null,     -- 구매 당시 상품명
  color         varchar(30)  not null,     -- 구매 당시 색상
  size          varchar(20)  not null,     -- 구매 당시 사이즈
  unit_price    integer      not null,     -- 구매 당시 단가
  image_path    varchar(300),              -- 구매 당시 대표 이미지
  quantity      integer      not null,
  line_total    integer      not null,
  constraint order_items_price_check    check (unit_price >= 0),
  constraint order_items_quantity_check check (quantity between 1 and 99),
  constraint order_items_total_check    check (line_total = unit_price * quantity)
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------
-- ⑦ 좋아요
-- ---------------------------------------------------------------------
create table public.likes (
  member_id   bigint      not null references public.members (id) on delete cascade,
  product_id  bigint      not null references public.products (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (member_id, product_id)
);
create index likes_product_idx on public.likes (product_id);

-- ---------------------------------------------------------------------
-- ⑧ 리뷰
-- ---------------------------------------------------------------------
create table public.review_rating_labels (
  rating  smallint    primary key,
  label   varchar(30) not null,
  constraint review_rating_labels_check check (rating between 1 and 5)
);

create table public.reviews (
  id             bigint generated always as identity primary key,
  member_id      bigint       not null references public.members (id) on delete cascade,
  product_id     bigint       not null references public.products (id) on delete cascade,
  order_item_id  bigint       not null unique references public.order_items (id) on delete cascade,
  rating         smallint     not null,
  content        text         not null,
  image_path     varchar(300),
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now(),
  constraint reviews_rating_check  check (rating between 1 and 5),
  constraint reviews_content_check check (char_length(content) between 1 and 2000)
);
create index reviews_product_idx on public.reviews (product_id, created_at desc);
create index reviews_member_idx on public.reviews (member_id);

create trigger reviews_set_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

/** 리뷰 무결성: 본인이 구매한 주문 상품이며, 주문 상품과 리뷰 대상 상품이 일치해야 함 */
create or replace function public.validate_review_purchase()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
     where oi.id = new.order_item_id
       and o.member_id = new.member_id
       and o.order_status = 'PAID'
       and oi.product_id = new.product_id
  ) then
    raise exception 'REVIEW_NOT_PURCHASED';
  end if;
  return new;
end;
$$;

create trigger reviews_validate_purchase
  before insert or update of member_id, product_id, order_item_id on public.reviews
  for each row execute function public.validate_review_purchase();

-- ---------------------------------------------------------------------
-- ⑩ 메인 페이지 콘텐츠
-- ---------------------------------------------------------------------
create table public.banners (
  id                bigint generated always as identity primary key,
  banner_type       varchar(10)  not null,
  image_path        varchar(300) not null,
  headline          varchar(100),
  sub_headline      varchar(100),
  button_label      varchar(50),
  link_product_id   bigint references public.products (id) on delete set null,
  link_category_id  bigint references public.categories (id) on delete set null,
  sort_order        integer      not null default 0,
  is_active         boolean      not null default true,
  created_at        timestamptz  not null default now(),
  constraint banners_type_check check (banner_type in ('MAIN', 'AD'))
);

create table public.style_magazines (
  id          bigint generated always as identity primary key,
  image_path  varchar(300) not null,
  sort_order  integer      not null default 0,
  is_active   boolean      not null default true,
  created_at  timestamptz  not null default now()
);

create table public.style_magazine_items (
  magazine_id  bigint      not null references public.style_magazines (id) on delete cascade,
  slot         varchar(10) not null,
  product_id   bigint      not null references public.products (id) on delete cascade,
  primary key (magazine_id, slot),
  constraint style_magazine_items_slot_check check (slot in ('TOP', 'BOTTOM', 'SHOES'))
);

create table public.shoe_guides (
  id                    bigint generated always as identity primary key,
  title                 varchar(50)  not null,   -- 예: 마라톤/하프 마라톤
  representative_label  varchar(50)  not null,   -- 예: 레이싱화
  product_id            bigint references public.products (id) on delete set null,
  category_id           bigint not null references public.categories (id) on delete restrict,
  target_pace           varchar(30)  not null,
  recommended_for       varchar(100) not null,
  image_path            varchar(300) not null,
  sort_order            integer      not null default 0,
  is_active             boolean      not null default true,
  created_at            timestamptz  not null default now()
);

-- ---------------------------------------------------------------------
-- 보안: 모든 테이블 RLS 활성화 + anon/authenticated 직접 접근 차단
-- (프론트엔드는 security definer RPC 함수로만 데이터에 접근)
-- ---------------------------------------------------------------------
alter table public.members              enable row level security;
alter table public.member_tokens        enable row level security;
alter table public.categories           enable row level security;
alter table public.products             enable row level security;
alter table public.product_options      enable row level security;
alter table public.product_images       enable row level security;
alter table public.carts                enable row level security;
alter table public.cart_items           enable row level security;
alter table public.addresses            enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.likes                enable row level security;
alter table public.review_rating_labels enable row level security;
alter table public.reviews              enable row level security;
alter table public.banners              enable row level security;
alter table public.style_magazines      enable row level security;
alter table public.style_magazine_items enable row level security;
alter table public.shoe_guides          enable row level security;

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
