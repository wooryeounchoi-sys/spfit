-- =====================================================================
-- SPFIT 초기 데이터 (3/3)
-- * 이미지 경로는 public/img_spfit 폴더에 실제 존재하는 파일만 사용
-- * 회원/주문/리뷰는 개발용 가상 데이터 (실제 개인정보 아님)
-- * 테스트 계정 비밀번호: spfit1234
-- =====================================================================

-- ---------------------------------------------------------------------
-- 별점 문구
-- ---------------------------------------------------------------------
insert into public.review_rating_labels (rating, label) values
  (1, '추천하지 않아요'),
  (2, '그냥 그래요'),
  (3, '나쁘지 않아요'),
  (4, '구매할만 해요'),
  (5, '강력 추천');

-- ---------------------------------------------------------------------
-- 카테고리 (상위 → 하위 → 최하위)
-- ---------------------------------------------------------------------
insert into public.categories (parent_id, name, depth, sort_order) values
  (null, 'Men', 1, 1),
  (null, 'Women', 1, 2),
  (null, 'Running Shoes', 1, 3),
  (null, 'ACC.', 1, 4);

insert into public.categories (parent_id, name, depth, sort_order)
select t.id, v.name, 2, v.ord
  from (values
    ('Men', '아우터', 1), ('Men', '상의', 2), ('Men', '하의', 3),
    ('Women', '아우터', 1), ('Women', '상의', 2), ('Women', '하의', 3),
    ('Running Shoes', '레이스', 1), ('Running Shoes', '스피드', 2), ('Running Shoes', '데일리', 3),
    ('ACC.', '러닝 벨트', 1), ('ACC.', '러닝 베스트', 2), ('ACC.', '무릎보호대', 3)
  ) as v (parent, name, ord)
  join public.categories t on t.parent_id is null and t.name = v.parent;

insert into public.categories (parent_id, name, depth, sort_order)
select m.id, v.name, 3, v.ord
  from (values
    ('Men', '아우터', '자켓', 1), ('Men', '아우터', '베스트', 2),
    ('Men', '상의', '반팔 티셔츠', 1), ('Men', '상의', '긴팔 티셔츠', 2), ('Men', '상의', '맨투맨', 3),
    ('Men', '하의', '숏 팬츠', 1), ('Men', '하의', '롱 팬츠', 2),
    ('Women', '아우터', '자켓', 1), ('Women', '아우터', '베스트', 2),
    ('Women', '상의', '반팔 티셔츠', 1), ('Women', '상의', '긴팔 티셔츠', 2), ('Women', '상의', '맨투맨', 3),
    ('Women', '하의', '숏 팬츠', 1), ('Women', '하의', '롱 팬츠', 2), ('Women', '하의', '스커트&레깅스', 3)
  ) as v (top, mid, name, ord)
  join public.categories t on t.parent_id is null and t.name = v.top
  join public.categories m on m.parent_id = t.id and m.name = v.mid;

-- ---------------------------------------------------------------------
-- 상품 + 옵션 (색상 x 사이즈 조합으로 옵션 생성)
-- ---------------------------------------------------------------------
with recursive cpath as (
  select id, name::text as path from public.categories where parent_id is null
  union all
  select c.id, p.path || '>' || c.name from public.categories c join cpath p on c.parent_id = p.id
),
src (path, name, description, price, colors, sizes, stock) as (values
  -- Men > 아우터 > 자켓
  ('Men>아우터>자켓', '에어로 윈드 러닝 자켓', '가벼운 립스탑 원단으로 바람을 막아주는 러닝 자켓', 129000, array['BLACK','NAVY'], array['S','M','L','XL'], 15),
  ('Men>아우터>자켓', '스톰쉴드 방수 자켓', '비 오는 날에도 달릴 수 있는 방수 코팅 자켓', 159000, array['BLACK','KHAKI'], array['M','L','XL'], 10),
  ('Men>아우터>자켓', '라이트 패커블 자켓', '주머니에 접어 넣을 수 있는 초경량 자켓', 99000, array['GRAY','BLACK'], array['S','M','L','XL'], 20),
  -- Men > 아우터 > 베스트
  ('Men>아우터>베스트', '써모 패딩 베스트', '쌀쌀한 새벽 러닝을 위한 보온 패딩 베스트', 119000, array['BLACK','NAVY'], array['M','L','XL'], 12),
  ('Men>아우터>베스트', '에어로 메쉬 베스트', '통기성이 뛰어난 메쉬 패널 베스트', 79000, array['BLACK','WHITE'], array['S','M','L','XL'], 18),
  ('Men>아우터>베스트', '리플렉티브 러닝 베스트', '야간 러닝용 반사 소재 베스트', 89000, array['NEON','BLACK'], array['M','L','XL'], 14),
  -- Men > 상의 > 반팔 티셔츠
  ('Men>상의>반팔 티셔츠', '드라이핏 레이스 반팔 티셔츠', '땀을 빠르게 말려주는 레이스용 반팔 티셔츠', 49000, array['WHITE','BLACK','BLUE'], array['S','M','L','XL'], 30),
  ('Men>상의>반팔 티셔츠', '쿨링 메쉬 반팔 티셔츠', '여름 러닝에 시원한 메쉬 반팔 티셔츠', 45000, array['GRAY','BLACK'], array['S','M','L','XL'], 30),
  ('Men>상의>반팔 티셔츠', '스핏 로고 반팔 티셔츠', '데일리로 입기 좋은 스핏 로고 반팔 티셔츠', 39000, array['WHITE','NAVY'], array['S','M','L','XL'], 40),
  -- Men > 상의 > 긴팔 티셔츠
  ('Men>상의>긴팔 티셔츠', '알파 다이렉트 긴팔 티셔츠', '보온성과 통기성을 동시에 갖춘 긴팔 티셔츠', 141550, array['RED','BLACK'], array['S','L'], 10),
  ('Men>상의>긴팔 티셔츠', '하프집 러닝 긴팔 티셔츠', '체온 조절이 쉬운 하프집 긴팔 티셔츠', 69000, array['BLACK','NAVY'], array['M','L','XL'], 20),
  ('Men>상의>긴팔 티셔츠', '써멀 베이스레이어 긴팔', '겨울 러닝용 기모 베이스레이어', 59000, array['BLACK','GRAY'], array['S','M','L','XL'], 25),
  -- Men > 상의 > 맨투맨
  ('Men>상의>맨투맨', '테크 플리스 맨투맨', '러닝 전후로 입기 좋은 테크 플리스 맨투맨', 89000, array['GRAY','BLACK'], array['M','L','XL'], 15),
  ('Men>상의>맨투맨', '스핏 클래식 맨투맨', '스핏 로고가 들어간 클래식 맨투맨', 69000, array['NAVY','WHITE'], array['S','M','L','XL'], 20),
  ('Men>상의>맨투맨', '리커버리 크루넥 맨투맨', '러닝 후 회복 시간을 위한 부드러운 맨투맨', 79000, array['BEIGE','BLACK'], array['M','L','XL'], 15),
  -- Men > 하의 > 숏 팬츠
  ('Men>하의>숏 팬츠', '5인치 레이스 숏 팬츠', '가볍고 움직임이 자유로운 5인치 숏 팬츠', 49000, array['BLACK','NAVY'], array['S','M','L','XL'], 25),
  ('Men>하의>숏 팬츠', '2in1 러닝 숏 팬츠', '이너 타이츠가 결합된 2in1 숏 팬츠', 59000, array['BLACK','GRAY'], array['M','L','XL'], 20),
  ('Men>하의>숏 팬츠', '스플릿 마라톤 숏 팬츠', '보폭을 방해하지 않는 사이드 스플릿 숏 팬츠', 55000, array['BLACK','WHITE'], array['S','M','L'], 18),
  -- Men > 하의 > 롱 팬츠
  ('Men>하의>롱 팬츠', '플리스 조거 팬츠', '보온성이 좋은 플리스 소재 조거 팬츠', 85000, array['BLACK','GRAY'], array['M','L','XL'], 15),
  ('Men>하의>롱 팬츠', '윈터 러닝 타이츠', '겨울철 근육 보호를 위한 기모 러닝 타이츠', 79000, array['BLACK'], array['S','M','L','XL'], 20),
  ('Men>하의>롱 팬츠', '테이퍼드 트랙 팬츠', '발목으로 갈수록 좁아지는 핏의 트랙 팬츠', 89000, array['BLACK','NAVY'], array['M','L','XL'], 15),
  -- Women > 아우터 > 자켓
  ('Women>아우터>자켓', '페더라이트 윈드브레이커', '깃털처럼 가벼운 후드 윈드브레이커', 119000, array['WHITE','BLACK'], array['XS','S','M','L'], 15),
  ('Women>아우터>자켓', '핏 컨투어 집업 자켓', '몸에 감기는 슬림핏 집업 자켓', 98000, array['PINK','BLACK'], array['XS','S','M','L'], 15),
  ('Women>아우터>자켓', '올웨더 러닝 자켓', '바람과 가벼운 비를 막아주는 러닝 자켓', 149000, array['NAVY','KHAKI'], array['S','M','L'], 10),
  -- Women > 아우터 > 베스트
  ('Women>아우터>베스트', '라이트 퀼팅 베스트', '가벼운 퀼팅 패턴의 보온 베스트', 99000, array['BLACK','BEIGE'], array['XS','S','M','L'], 12),
  ('Women>아우터>베스트', '에어 메쉬 러닝 베스트', '통기성 좋은 메쉬 러닝 베스트', 75000, array['WHITE','BLACK'], array['S','M','L'], 15),
  ('Women>아우터>베스트', '리플렉티브 나이트런 베스트', '야간 러닝을 위한 반사 소재 베스트', 85000, array['NEON','BLACK'], array['S','M','L'], 12),
  -- Women > 상의 > 반팔 티셔츠
  ('Women>상의>반팔 티셔츠', '크롭 러닝 탱크탑', '하이넥 디자인의 크롭 러닝 탱크탑', 39000, array['BLACK','WHITE'], array['XS','S','M','L'], 30),
  ('Women>상의>반팔 티셔츠', '레이서백 러닝 탱크탑', '팔 움직임이 자유로운 레이서백 탱크탑', 42000, array['BLUE','GRAY'], array['XS','S','M','L'], 30),
  ('Women>상의>반팔 티셔츠', '서포트 스포츠 브라탑', '흔들림을 잡아주는 미디엄 서포트 브라탑', 49000, array['WHITE','BLACK','PINK'], array['XS','S','M','L'], 30),
  -- Women > 상의 > 긴팔 티셔츠
  ('Women>상의>긴팔 티셔츠', '롱슬리브 하프집 탑', '슬림핏 하프집 롱슬리브 탑', 69000, array['BLACK','WHITE'], array['XS','S','M','L'], 20),
  ('Women>상의>긴팔 티셔츠', '크롭 집업 롱슬리브', '크롭 기장의 집업 롱슬리브', 72000, array['NAVY','BLACK'], array['XS','S','M','L'], 20),
  ('Women>상의>긴팔 티셔츠', '소프트 터치 긴팔 티셔츠', '부드러운 촉감의 데일리 긴팔 티셔츠', 55000, array['GRAY','PINK'], array['S','M','L'], 20),
  -- Women > 상의 > 맨투맨
  ('Women>상의>맨투맨', '크롭 맨투맨', '짧은 기장의 크롭 맨투맨', 69000, array['GRAY','PINK'], array['XS','S','M'], 15),
  ('Women>상의>맨투맨', '오버핏 스웨트셔츠', '여유 있는 오버핏 스웨트셔츠', 79000, array['BLACK','BEIGE'], array['S','M','L'], 15),
  ('Women>상의>맨투맨', '하프집 플리스 맨투맨', '보온성이 좋은 하프집 플리스 맨투맨', 85000, array['WHITE','NAVY'], array['S','M','L'], 12),
  -- Women > 하의 > 숏 팬츠
  ('Women>하의>숏 팬츠', '하이웨이스트 러닝 숏츠', '허리를 잡아주는 하이웨이스트 러닝 숏츠', 49000, array['BLACK','PINK','NAVY'], array['XS','S','M','L'], 30),
  ('Women>하의>숏 팬츠', '템포 러닝 숏츠', '이너 브리프가 있는 템포 러닝 숏츠', 45000, array['PINK','NAVY','BLACK'], array['XS','S','M','L'], 30),
  ('Women>하의>숏 팬츠', '스플릿 레이스 숏츠', '레이스용 스플릿 숏츠', 52000, array['BLACK','WHITE'], array['XS','S','M'], 20),
  -- Women > 하의 > 롱 팬츠
  ('Women>하의>롱 팬츠', '우먼 플리스 조거 팬츠', '보온성이 좋은 여성용 플리스 조거 팬츠', 85000, array['BLACK','GRAY'], array['XS','S','M','L'], 15),
  ('Women>하의>롱 팬츠', '플레어 요가 팬츠', '러닝 후 스트레칭에 좋은 플레어 팬츠', 79000, array['BLACK','NAVY'], array['XS','S','M','L'], 15),
  ('Women>하의>롱 팬츠', '윈드 트랙 팬츠', '바람을 막아주는 경량 트랙 팬츠', 89000, array['BLACK','KHAKI'], array['S','M','L'], 12),
  -- Women > 하의 > 스커트&레깅스
  ('Women>하의>스커트&레깅스', '바이크 쇼츠 레깅스', '허벅지를 잡아주는 바이크 쇼츠 레깅스', 59000, array['BLACK','NAVY'], array['XS','S','M','L'], 25),
  ('Women>하의>스커트&레깅스', '러닝 스커트', '이너 쇼츠가 있는 플리츠 러닝 스커트', 55000, array['BLACK','WHITE'], array['XS','S','M'], 20),
  ('Women>하의>스커트&레깅스', '하이라이즈 롱 레깅스', '하이라이즈 롱 레깅스', 69000, array['BLACK','GRAY'], array['XS','S','M','L'], 25),
  -- Running Shoes > 레이스
  ('Running Shoes>레이스', '엣지 도쿄', '카본 플레이트가 들어간 기록 단축용 레이싱화', 329000, array['NEON','WHITE'], array['230','240','250','260','270','280'], 8),
  ('Running Shoes>레이스', '카본 플라이트 프로', '반발력이 뛰어난 카본 레이싱화', 289000, array['WHITE','BLACK'], array['230','240','250','260','270','280'], 8),
  ('Running Shoes>레이스', '레코드 브레이커 3', '하프·풀코스 대회용 경량 레이싱화', 259000, array['BLUE','WHITE'], array['240','250','260','270','280'], 8),
  -- Running Shoes > 스피드
  ('Running Shoes>스피드', '템포 스피드 2', '템포런과 인터벌에 최적화된 스피드화', 189000, array['WHITE','BLACK'], array['230','240','250','260','270','280'], 10),
  ('Running Shoes>스피드', '인터벌 플라이', '빠른 전환을 돕는 경량 스피드화', 169000, array['WHITE','PURPLE'], array['230','240','250','260','270'], 10),
  ('Running Shoes>스피드', '페이스 메이커', '페이스 유지에 도움을 주는 안정형 스피드화', 179000, array['BLACK','BLUE'], array['240','250','260','270','280'], 10),
  -- Running Shoes > 데일리
  ('Running Shoes>데일리', '클라우드 데일리 러너', '매일 신기 좋은 쿠셔닝 데일리 러닝화', 139000, array['WHITE','BLACK'], array['230','240','250','260','270','280'], 15),
  ('Running Shoes>데일리', '레트로 조그 530', '레트로 감성의 데일리 조깅화', 129000, array['SILVER','WHITE'], array['230','240','250','260','270','280'], 15),
  ('Running Shoes>데일리', '컴포트 맥스', '맥스 쿠셔닝으로 편안한 데일리 러닝화', 149000, array['WHITE','GRAY'], array['230','240','250','260','270','280'], 15),
  -- ACC. > 러닝 벨트
  ('ACC.>러닝 벨트', '슬림 러닝 벨트', '휴대폰과 카드를 넣는 슬림 러닝 벨트', 29000, array['BLACK','GRAY'], array['FREE'], 40),
  ('ACC.>러닝 벨트', '보틀 홀더 러닝 벨트', '물병 홀더가 달린 러닝 벨트', 39000, array['BLACK'], array['FREE'], 30),
  ('ACC.>러닝 벨트', '리플렉티브 러닝 벨트', '야간 러닝용 반사 소재 러닝 벨트', 35000, array['NEON','BLACK'], array['FREE'], 30),
  -- ACC. > 러닝 베스트
  ('ACC.>러닝 베스트', '하이드레이션 러닝 베스트 5L', '장거리 러닝을 위한 5L 하이드레이션 베스트', 119000, array['BLACK','BLUE'], array['S/M','L/XL'], 10),
  ('ACC.>러닝 베스트', '트레일 러닝 베스트 10L', '트레일 러닝용 10L 수납 베스트', 149000, array['BLACK'], array['S/M','L/XL'], 8),
  ('ACC.>러닝 베스트', '라이트 러닝 베스트 2L', '가볍게 착용하는 2L 러닝 베스트', 89000, array['GRAY','BLACK'], array['S/M','L/XL'], 12),
  -- ACC. > 무릎보호대
  ('ACC.>무릎보호대', '컴프레션 무릎보호대', '무릎 관절을 압박 지지하는 무릎보호대', 35000, array['BLACK'], array['S','M','L'], 30),
  ('ACC.>무릎보호대', '패텔라 무릎 스트랩', '슬개골을 잡아주는 무릎 스트랩', 25000, array['BLACK','GRAY'], array['FREE'], 30),
  ('ACC.>무릎보호대', '니 서포트 슬리브', '가벼운 착용감의 니 서포트 슬리브', 45000, array['BLACK','BEIGE'], array['S','M','L'], 25)
),
ins as (
  insert into public.products (category_id, name, description, base_price)
  select cp.id, s.name, s.description, s.price
    from src s
    join cpath cp on cp.path = s.path
  returning id, name
)
insert into public.product_options (product_id, color, size, stock, sort_order)
select ins.id, c.color, z.size, s.stock, (c.ci * 100 + z.zi)::integer
  from ins
  join src s on s.name = ins.name
  cross join lateral unnest(s.colors) with ordinality as c (color, ci)
  cross join lateral unnest(s.sizes) with ordinality as z (size, zi);

-- 일부 옵션은 품절 상태로 설정 (재고 검증 테스트용)
update public.product_options o
   set stock = 0
  from public.products p
 where p.id = o.product_id and p.name = '엣지 도쿄' and o.size = '280';

-- ---------------------------------------------------------------------
-- 상품 이미지 (img_spfit 폴더에 실제 존재하는 파일만 연결)
-- * 해당 상품을 착용한 모델 사진(룩북)을 대표 이미지로 사용
-- * 이미지가 없는 상품은 프론트에서 빈 이미지 영역으로 표시
-- ---------------------------------------------------------------------
insert into public.product_images (product_id, image_path, image_type, is_primary, sort_order)
select p.id, v.path, v.image_type, v.is_primary, v.ord
  from (values
    ('롱슬리브 하프집 탑',        'img_spfit/model/model_1.jpg', 'LOOKBOOK', true, 1),
    ('페더라이트 윈드브레이커',   'img_spfit/model/model_2.jpg', 'LOOKBOOK', true, 1),
    ('스플릿 레이스 숏츠',        'img_spfit/model/model_2.jpg', 'LOOKBOOK', true, 1),
    ('인터벌 플라이',             'img_spfit/model/model_2.jpg', 'LOOKBOOK', true, 1),
    ('크롭 러닝 탱크탑',          'img_spfit/model/model_3.jpg', 'LOOKBOOK', true, 1),
    ('하이웨이스트 러닝 숏츠',    'img_spfit/model/model_3.jpg', 'LOOKBOOK', true, 1),
    ('하이웨이스트 러닝 숏츠',    'img_spfit/model/model_1.jpg', 'LOOKBOOK', false, 2),
    ('하이웨이스트 러닝 숏츠',    'img_spfit/model/model_5.jpg', 'LOOKBOOK', false, 3),
    ('레이서백 러닝 탱크탑',      'img_spfit/model/model_4.jpg', 'LOOKBOOK', true, 1),
    ('바이크 쇼츠 레깅스',        'img_spfit/model/model_4.jpg', 'LOOKBOOK', true, 1),
    ('컴포트 맥스',               'img_spfit/model/model_4.jpg', 'LOOKBOOK', true, 1),
    ('서포트 스포츠 브라탑',      'img_spfit/model/model_6.jpg', 'LOOKBOOK', true, 1),
    ('서포트 스포츠 브라탑',      'img_spfit/model/model_5.jpg', 'LOOKBOOK', false, 2),
    ('레트로 조그 530',           'img_spfit/model/model_5.jpg', 'LOOKBOOK', true, 1),
    ('레트로 조그 530',           'img_spfit/model/model_7.jpg', 'LOOKBOOK', false, 2),
    ('템포 러닝 숏츠',            'img_spfit/model/model_6.jpg', 'LOOKBOOK', true, 1),
    ('템포 러닝 숏츠',            'img_spfit/model/model_7.jpg', 'LOOKBOOK', false, 2),
    ('템포 러닝 숏츠',            'img_spfit/model/model_8.jpg', 'LOOKBOOK', false, 3),
    ('크롭 집업 롱슬리브',        'img_spfit/model/model_7.jpg', 'LOOKBOOK', true, 1),
    ('핏 컨투어 집업 자켓',       'img_spfit/model/model_8.jpg', 'LOOKBOOK', true, 1),
    ('클라우드 데일리 러너',      'img_spfit/model/model_1.jpg', 'LOOKBOOK', true, 1),
    ('클라우드 데일리 러너',      'img_spfit/model/model_3.jpg', 'LOOKBOOK', false, 2),
    ('클라우드 데일리 러너',      'img_spfit/model/model_6.jpg', 'LOOKBOOK', false, 3),
    ('클라우드 데일리 러너',      'img_spfit/model/model_8.jpg', 'LOOKBOOK', false, 4),
    ('엣지 도쿄',                 'img_spfit/content/content1.jpg', 'MAIN', true, 1)
  ) as v (product_name, path, image_type, is_primary, ord)
  join public.products p on p.name = v.product_name;

-- ---------------------------------------------------------------------
-- 메인 콘텐츠: 배너
-- ---------------------------------------------------------------------
insert into public.banners (banner_type, image_path, headline, sub_headline, button_label, link_category_id, sort_order)
values
  ('MAIN', 'img_spfit/main_banner.jpg', 'Find Your Speed,', 'Perfect Your Fit.', null, null, 1),
  ('AD', 'img_spfit/second_banner.jpg', 'Fit 한 러닝을 즐겨보세요', null, 'BEST 구매하기',
   (select c3.id from public.categories c1
      join public.categories c2 on c2.parent_id = c1.id and c2.name = '아우터'
      join public.categories c3 on c3.parent_id = c2.id and c3.name = '자켓'
     where c1.parent_id is null and c1.name = 'Men'), 1);

-- ---------------------------------------------------------------------
-- 메인 콘텐츠: Style Magazine (모델 사진 + 착장 상품 TOP/BOTTOM/SHOES)
-- ---------------------------------------------------------------------
insert into public.style_magazines (image_path, sort_order)
select 'img_spfit/model/model_' || n || '.jpg', n from generate_series(1, 8) as n;

insert into public.style_magazine_items (magazine_id, slot, product_id)
select s.id, v.slot, p.id
  from (values
    (1, 'TOP', '롱슬리브 하프집 탑'),      (1, 'BOTTOM', '하이웨이스트 러닝 숏츠'), (1, 'SHOES', '클라우드 데일리 러너'),
    (2, 'TOP', '페더라이트 윈드브레이커'), (2, 'BOTTOM', '스플릿 레이스 숏츠'),     (2, 'SHOES', '인터벌 플라이'),
    (3, 'TOP', '크롭 러닝 탱크탑'),        (3, 'BOTTOM', '하이웨이스트 러닝 숏츠'), (3, 'SHOES', '클라우드 데일리 러너'),
    (4, 'TOP', '레이서백 러닝 탱크탑'),    (4, 'BOTTOM', '바이크 쇼츠 레깅스'),     (4, 'SHOES', '컴포트 맥스'),
    (5, 'TOP', '서포트 스포츠 브라탑'),    (5, 'BOTTOM', '하이웨이스트 러닝 숏츠'), (5, 'SHOES', '레트로 조그 530'),
    (6, 'TOP', '서포트 스포츠 브라탑'),    (6, 'BOTTOM', '템포 러닝 숏츠'),         (6, 'SHOES', '클라우드 데일리 러너'),
    (7, 'TOP', '크롭 집업 롱슬리브'),      (7, 'BOTTOM', '템포 러닝 숏츠'),         (7, 'SHOES', '레트로 조그 530'),
    (8, 'TOP', '핏 컨투어 집업 자켓'),     (8, 'BOTTOM', '템포 러닝 숏츠'),         (8, 'SHOES', '클라우드 데일리 러너')
  ) as v (ord, slot, product_name)
  join public.style_magazines s on s.sort_order = v.ord
  join public.products p on p.name = v.product_name;

-- ---------------------------------------------------------------------
-- 메인 콘텐츠: Check Your Shoes
-- ---------------------------------------------------------------------
insert into public.shoe_guides (title, representative_label, product_id, category_id, target_pace, recommended_for, image_path, sort_order)
select v.title, v.label, p.id, c.id, v.pace, v.target, v.img, v.ord
  from (values
    (1, '마라톤/하프 마라톤', '레이싱화', '레이스', '엣지 도쿄', '4''00~4''30', '기록 단축을 원하는 러너', 'img_spfit/content/content1.jpg'),
    (2, '템포런/인터벌', '스피드화', '스피드', '템포 스피드 2', '4''30~5''30', '스피드와 페이스 유지를 원하는 러너', 'img_spfit/content/content2.jpg'),
    (3, '이지런/Zone 2 러닝', '데일리화', '데일리', '클라우드 데일리 러너', '6''00~6''30', '일상적으로 꾸준히 달리는 러너', 'img_spfit/content/content3.jpg')
  ) as v (ord, title, label, cat, product_name, pace, target, img)
  join public.categories root on root.parent_id is null and root.name = 'Running Shoes'
  join public.categories c on c.parent_id = root.id and c.name = v.cat
  join public.products p on p.name = v.product_name;

-- ---------------------------------------------------------------------
-- 개발용 가상 회원 (비밀번호: spfit1234)
-- ---------------------------------------------------------------------
insert into public.members (login_id, password_hash, name, email, phone, birth_date)
values
  ('spfit01', extensions.crypt('spfit1234', extensions.gen_salt('bf', 10)), '김스핏', 'spfit01@example.com', '010-0000-0001', '2000-03-15'),
  ('spfit02', extensions.crypt('spfit1234', extensions.gen_salt('bf', 10)), '이러너', 'spfit02@example.com', '010-0000-0002', '1997-08-21'),
  ('spfit03', extensions.crypt('spfit1234', extensions.gen_salt('bf', 10)), '박페이스', 'spfit03@example.com', '010-0000-0003', '1993-11-02');

insert into public.carts (member_id) select id from public.members;

insert into public.addresses (member_id, address_name, road_address, detail_address, is_default)
select m.id, '집', v.road, v.detail, true
  from (values
    ('spfit01', '서울특별시 가상구 스핏로 101', '스핏아파트 101동 1001호'),
    ('spfit02', '서울특별시 가상구 러너대로 22', '러너빌라 202호')
  ) as v (login_id, road, detail)
  join public.members m on m.login_id = v.login_id;

-- ---------------------------------------------------------------------
-- 개발용 가상 주문 + 리뷰 (리뷰는 반드시 구매 내역과 연결)
-- 시드 전용 임시 함수 → 사용 후 삭제
-- ---------------------------------------------------------------------
create or replace function public._seed_order(
  p_login_id text, p_ordered_at timestamptz, p_delivery text, p_payment text, p_lines jsonb)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_member public.members%rowtype;
  v_order_id bigint;
  v_line jsonb;
  v_opt record;
  v_item_id bigint;
  v_total_qty integer := 0;
  v_total_amount integer := 0;
begin
  select * into v_member from public.members where login_id = p_login_id;

  insert into public.orders (member_id, order_number, recipient_name, ship_road_address, ship_detail_address,
                             total_quantity, total_amount, payment_method, delivery_status, ordered_at)
  select v_member.id,
         'SP' || to_char(p_ordered_at, 'YYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0'),
         v_member.name, coalesce(a.road_address, '서울특별시 가상구 스핏로 1'), coalesce(a.detail_address, ''),
         1, 0, p_payment, p_delivery, p_ordered_at
    from (select 1) d
    left join public.addresses a on a.member_id = v_member.id and a.is_default
  returning id into v_order_id;

  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    select o.id as option_id, p.id as product_id, p.name, o.color, o.size,
           p.base_price + o.extra_price as unit_price
      into v_opt
      from public.products p
      join public.product_options o on o.product_id = p.id
     where p.name = v_line ->> 'name' and o.color = v_line ->> 'color' and o.size = v_line ->> 'size';
    if v_opt.option_id is null then
      raise exception 'SEED_OPTION_NOT_FOUND: %', v_line;
    end if;

    insert into public.order_items (order_id, product_id, option_id, product_name, color, size,
                                    unit_price, image_path, quantity, line_total)
    values (v_order_id, v_opt.product_id, v_opt.option_id, v_opt.name, v_opt.color, v_opt.size,
            v_opt.unit_price, public._primary_image(v_opt.product_id), (v_line ->> 'qty')::integer,
            v_opt.unit_price * (v_line ->> 'qty')::integer)
    returning id into v_item_id;

    v_total_qty := v_total_qty + (v_line ->> 'qty')::integer;
    v_total_amount := v_total_amount + v_opt.unit_price * (v_line ->> 'qty')::integer;

    if v_line ? 'rating' then
      insert into public.reviews (member_id, product_id, order_item_id, rating, content, image_path, created_at, updated_at)
      values (v_member.id, v_opt.product_id, v_item_id, (v_line ->> 'rating')::smallint, v_line ->> 'review',
              v_line ->> 'review_image', p_ordered_at + interval '5 days', p_ordered_at + interval '5 days');
    end if;
  end loop;

  update public.orders set total_quantity = v_total_qty, total_amount = v_total_amount where id = v_order_id;
end;
$$;

select public._seed_order('spfit01', '2026-10-01 10:00+09', 'DELIVERED', 'GENERAL', '[
  {"name": "롱슬리브 하프집 탑", "color": "BLACK", "size": "S", "qty": 1, "rating": 5,
   "review": "몸에 딱 붙는 핏이라 달릴 때 펄럭임이 없어요. 사진도 예쁘게 나와서 러닝 기록 올릴 때마다 입고 있어요.",
   "review_image": "img_spfit/review/SF_R1.jpg"},
  {"name": "하이웨이스트 러닝 숏츠", "color": "BLACK", "size": "S", "qty": 1, "rating": 4,
   "review": "허리 밴드가 잘 잡아줘서 흘러내리지 않아요. 주머니가 조금 더 컸으면 좋겠어요."}
]');

select public._seed_order('spfit01', '2026-11-05 20:30+09', 'SHIPPING', 'EASY', '[
  {"name": "엣지 도쿄", "color": "NEON", "size": "240", "qty": 1}
]');

select public._seed_order('spfit02', '2026-10-12 13:00+09', 'DELIVERED', 'EASY', '[
  {"name": "클라우드 데일리 러너", "color": "WHITE", "size": "250", "qty": 1, "rating": 5,
   "review": "퇴근 후 이지런 할 때 매일 신고 있어요. 쿠션이 좋아서 무릎이 편하고 어떤 옷에도 잘 어울립니다.",
   "review_image": "img_spfit/review/SF_R2.jpg"},
  {"name": "템포 러닝 숏츠", "color": "PINK", "size": "M", "qty": 2, "rating": 3,
   "review": "색감은 예쁜데 생각보다 기장이 짧아요. 한 치수 크게 사는 걸 추천합니다."}
]');

select public._seed_order('spfit02', '2026-11-08 09:15+09', 'READY', 'GENERAL', '[
  {"name": "알파 다이렉트 긴팔 티셔츠", "color": "BLACK", "size": "L", "qty": 1}
]');

select public._seed_order('spfit03', '2026-09-20 18:00+09', 'DELIVERED', 'GENERAL', '[
  {"name": "엣지 도쿄", "color": "WHITE", "size": "270", "qty": 1, "rating": 5,
   "review": "하프 마라톤에서 개인 기록을 3분 단축했어요. 반발력이 확실히 다릅니다. 대회용으로 강력 추천해요.",
   "review_image": "img_spfit/review/SF_R3.jpg"},
  {"name": "레트로 조그 530", "color": "SILVER", "size": "260", "qty": 1, "rating": 4,
   "review": "디자인이 예뻐서 러닝 후 카페 갈 때도 신어요. 장거리보다는 가벼운 조깅에 어울려요.",
   "review_image": "img_spfit/review/SF_R4.jpg"},
  {"name": "5인치 레이스 숏 팬츠", "color": "BLACK", "size": "L", "qty": 1, "rating": 2,
   "review": "가볍긴 한데 허벅지 쪽이 쓸려서 장거리에는 불편했어요."}
]');

drop function public._seed_order(text, timestamptz, text, text, jsonb);
