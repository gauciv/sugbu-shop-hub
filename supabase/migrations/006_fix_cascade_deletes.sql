-- Fix foreign keys that block user deletion.
-- orders.buyer_id and orders.shop_id lack ON DELETE CASCADE,
-- so deleting a profile (or its auth.users row) is rejected by Postgres.
-- Same issue with order_items.product_id blocking product/shop deletion.

-- orders.buyer_id → profiles(id)
alter table public.orders
  drop constraint orders_buyer_id_fkey,
  add constraint orders_buyer_id_fkey
    foreign key (buyer_id) references public.profiles(id) on delete cascade;

-- orders.shop_id → shops(id)
alter table public.orders
  drop constraint orders_shop_id_fkey,
  add constraint orders_shop_id_fkey
    foreign key (shop_id) references public.shops(id) on delete cascade;

-- order_items.product_id → products(id)
alter table public.order_items
  drop constraint order_items_product_id_fkey,
  add constraint order_items_product_id_fkey
    foreign key (product_id) references public.products(id) on delete cascade;
