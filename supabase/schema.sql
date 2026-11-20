-- 장봄 · Supabase 테이블 (products · favorites · orders)
-- Supabase 대시보드 › SQL Editor에 통째로 붙여 넣고 Run. 여러 번 실행해도 안전하다.
--
-- 근거: docs/08_solution-mvp.md(상품 도착 배지·자주 사는 상품), docs/10_screens.md(화면 구성),
--       docs/14_prototype.md(주문 완료 · 다시 주문하기), 지금 앱의 목업 데이터(src/data/mock.ts)
--
-- 권한 원칙: 읽기·만들기만. 수정(UPDATE)·삭제(DELETE)는 앱(anon·authenticated)에게 주지 않는다.
--   products  : 읽기     (상품은 SQL Editor/관리자만 추가)
--   favorites : 읽기 · 만들기
--   orders    : 만들기   (로그인이 없어 읽기를 열면 모든 사람의 주문·주소가 보이므로 막아 둠)

-- ─────────────────────────────────────────────
-- 1. products · 상품 (검색 결과 · 장바구니 · 홈 카드)
-- ─────────────────────────────────────────────
create table if not exists public.products (
  id            text primary key,                         -- 'fresh-milk' 같은 고정 id (이미지 파일 이름과 맞춤)
  name          text not null,                            -- 신선한 우유
  volume        text not null,                            -- 1,000mL · 10구 · 300g
  price         integer not null check (price > 0),       -- 원
  image         text not null check (image like '/images/%'), -- public/images/ 아래 Figma 이미지만
  arrival       text not null default 'confirmed'
                check (arrival in ('confirmed', 'unavailable')), -- 도착배지: 내일 아침 확정 / 불가
  sold_out      boolean not null default false,           -- 품절 배지
  cutoff        text check (cutoff ~ '^[0-2][0-9]:[0-5][0-9]$'), -- 이 상품만 다른 마감 (예: 22:00), 없으면 null
  substitute_id text references public.products (id),     -- 불가·품절일 때 제안하는 대체 상품
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 2. favorites · 자주 사는 상품 (홈 '자주 산 상품')
--    로그인이 아직 없어 사용자 구분 없이 한 목록으로 둔다.
-- ─────────────────────────────────────────────
create table if not exists public.favorites (
  id             bigint generated always as identity primary key,
  product_id     text not null unique references public.products (id),
  purchase_count integer not null default 1 check (purchase_count > 0), -- "6번 샀어요"
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 3. orders · 주문 (결제하기 → 주문 완료에서 한 줄 저장)
-- ─────────────────────────────────────────────
create table if not exists public.orders (
  id             bigint generated always as identity primary key,
  order_number   text not null unique,                    -- 앱이 만든 번호 (예: 20261120-4821)
  items          jsonb not null
                 check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
                 -- [{ "product_id": "fresh-milk", "name": "신선한 우유", "quantity": 1, "price": 2980 }, ...]
  item_count     integer not null check (item_count > 0),
  subtotal       integer not null check (subtotal >= 0),
  shipping_fee   integer not null check (shipping_fee >= 0),
  total          integer not null,
  address_label  text not null,                           -- 집 · 회사
  address        text not null,                           -- 서울시 ○○구 ○○로 12 101동 1001호
  arrival_text   text not null,                           -- 내일 아침 7시 전 도착
  created_at     timestamptz not null default now(),
  check (total = subtotal + shipping_fee)
);

-- ─────────────────────────────────────────────
-- 4. 권한 · RLS (행 단위 보안) + 테이블 권한
-- ─────────────────────────────────────────────
alter table public.products  enable row level security;
alter table public.favorites enable row level security;
alter table public.orders    enable row level security;

-- 수정·삭제는 누구에게도 주지 않는다 (RLS 정책이 없어도 한 번 더 막음)
revoke update, delete, truncate on public.products, public.favorites, public.orders from anon, authenticated;
revoke insert on public.products from anon, authenticated;
revoke select on public.orders from anon, authenticated;

grant select on public.products to anon, authenticated;
grant select, insert on public.favorites to anon, authenticated;
grant insert on public.orders to anon, authenticated;

drop policy if exists "products: 누구나 읽기" on public.products;
create policy "products: 누구나 읽기" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "favorites: 누구나 읽기" on public.favorites;
create policy "favorites: 누구나 읽기" on public.favorites
  for select to anon, authenticated using (true);

drop policy if exists "favorites: 누구나 만들기" on public.favorites;
create policy "favorites: 누구나 만들기" on public.favorites
  for insert to anon, authenticated with check (true);

drop policy if exists "orders: 누구나 만들기" on public.orders;
create policy "orders: 누구나 만들기" on public.orders
  for insert to anon, authenticated with check (true);

-- ─────────────────────────────────────────────
-- 5. 예시 데이터 · Figma 화면에 적힌 값 그대로 (이미 있으면 건너뜀)
-- ─────────────────────────────────────────────
insert into public.products (id, name, volume, price, image, arrival, sold_out, cutoff, substitute_id, sort_order) values
  ('fresh-milk',        '신선한 우유',   '1,000mL', 2980, '/images/products/fresh-milk.jpg',        'confirmed',   false, null,    null, 1),
  ('egg',               '계란',          '10구',    4990, '/images/products/egg.jpg',               'confirmed',   false, null,    null, 2),
  ('tofu',              '두부',          '300g',    1890, '/images/products/tofu.jpg',              'confirmed',   false, null,    null, 3),
  ('lactose-free-milk', '락토프리 우유', '1,000mL', 2890, '/images/products/lactose-free-milk.jpg', 'confirmed',   false, null,    null, 6)
on conflict (id) do nothing;

-- 대체 상품을 가리키는 상품은 대체 상품 다음에 넣는다
insert into public.products (id, name, volume, price, image, arrival, sold_out, cutoff, substitute_id, sort_order) values
  ('organic-milk',      '유기농 우유',   '900mL',   3200, '/images/products/organic-milk.jpg',      'unavailable', false, '22:00', 'lactose-free-milk', 4),
  ('low-fat-milk',      '저지방 우유',   '1,000mL', 2750, '/images/products/low-fat-milk.jpg',      'confirmed',   true,  null,    'lactose-free-milk', 5)
on conflict (id) do nothing;

insert into public.favorites (product_id, purchase_count, sort_order) values
  ('fresh-milk', 6, 1),
  ('egg',        5, 2),
  ('tofu',       4, 3)
on conflict (product_id) do nothing;

-- 확인용: products 6 · favorites 3 · orders 0이면 성공
select
  (select count(*) from public.products)  as products,
  (select count(*) from public.favorites) as favorites,
  (select count(*) from public.orders)    as orders;
