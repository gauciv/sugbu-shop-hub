-- Decrement product stock when order items are inserted
create or replace function public.decrement_stock_on_order()
returns trigger as $$
begin
  update public.products
  set stock = greatest(stock - new.quantity, 0)
  where id = new.product_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_order_item_created
  after insert on public.order_items
  for each row execute function public.decrement_stock_on_order();

-- RPC function to decrement stock (callable from frontend as fallback)
create or replace function public.decrement_product_stock(p_product_id uuid, p_quantity int)
returns void as $$
begin
  update public.products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;
end;
$$ language plpgsql security definer;
