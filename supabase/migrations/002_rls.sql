-- Enable RLS
alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- PROFILES
create policy "Anyone can view profiles"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (id = auth.uid());
create policy "Profiles are created by trigger"
  on public.profiles for insert with check (true);

-- SHOPS
create policy "Anyone can view active shops"
  on public.shops for select using (is_active = true or owner_id = auth.uid());
create policy "Sellers can create their shop"
  on public.shops for insert with check (owner_id = auth.uid());
create policy "Sellers can update own shop"
  on public.shops for update using (owner_id = auth.uid());

-- CATEGORIES
create policy "Anyone can read categories"
  on public.categories for select using (true);

-- PRODUCTS
create policy "Anyone can view active products"
  on public.products for select using (
    is_active = true
    or shop_id in (select id from public.shops where owner_id = auth.uid())
  );
create policy "Sellers can insert products"
  on public.products for insert with check (
    shop_id in (select id from public.shops where owner_id = auth.uid())
  );
create policy "Sellers can update own products"
  on public.products for update using (
    shop_id in (select id from public.shops where owner_id = auth.uid())
  );
create policy "Sellers can delete own products"
  on public.products for delete using (
    shop_id in (select id from public.shops where owner_id = auth.uid())
  );

-- CART ITEMS
create policy "Users manage own cart"
  on public.cart_items for all using (user_id = auth.uid());

-- ORDERS
create policy "Buyers can view own orders"
  on public.orders for select using (buyer_id = auth.uid());
create policy "Sellers can view shop orders"
  on public.orders for select using (
    shop_id in (select id from public.shops where owner_id = auth.uid())
  );
create policy "Authenticated users can create orders"
  on public.orders for insert with check (buyer_id = auth.uid());
create policy "Sellers can update order status"
  on public.orders for update using (
    shop_id in (select id from public.shops where owner_id = auth.uid())
  );

-- ORDER ITEMS
create policy "Buyers can view own order items"
  on public.order_items for select using (
    order_id in (select id from public.orders where buyer_id = auth.uid())
  );
create policy "Sellers can view shop order items"
  on public.order_items for select using (
    order_id in (select id from public.orders where shop_id in (
      select id from public.shops where owner_id = auth.uid()
    ))
  );
create policy "Order items created with order"
  on public.order_items for insert with check (
    order_id in (select id from public.orders where buyer_id = auth.uid())
  );
