-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_url text,
  role text not null default 'buyer' check (role in ('buyer', 'seller')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Shops
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  banner_url text,
  contact_email text,
  contact_phone text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id)
);

create index idx_shops_slug on public.shops(slug);
create index idx_shops_owner on public.shops(owner_id);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  icon text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  stock int not null default 0 check (stock >= 0),
  image_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_shop on public.products(shop_id);
create index idx_products_category on public.products(category_id);

-- Cart items
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index idx_cart_user on public.cart_items(user_id);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  buyer_id uuid not null references public.profiles(id),
  shop_id uuid not null references public.shops(id),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  shipping_address text not null,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_buyer on public.orders(buyer_id, created_at desc);
create index idx_orders_shop on public.orders(shop_id, created_at desc);

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null
);

create index idx_order_items_order on public.order_items(order_id);

-- Generate order numbers
create or replace function public.generate_order_number()
returns trigger as $$
begin
  new.order_number := 'ORD-' || upper(substr(gen_random_uuid()::text, 1, 8));
  return new;
end;
$$ language plpgsql;

create trigger set_order_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger update_shops_updated_at before update on public.shops
  for each row execute function public.update_updated_at();
create trigger update_products_updated_at before update on public.products
  for each row execute function public.update_updated_at();
create trigger update_orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at();
