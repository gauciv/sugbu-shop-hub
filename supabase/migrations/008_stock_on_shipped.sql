-- Migration: Move stock decrement from order_items INSERT to orders UPDATE (shipped)
-- Previously stock was decremented when order items were created (at checkout).
-- Now stock is only decremented when the seller marks the order as "shipped",
-- meaning the product is actually leaving inventory.

-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_order_item_created ON public.order_items;
DROP FUNCTION IF EXISTS public.decrement_stock_on_order();

-- New function: decrement stock for all items when order is shipped
CREATE OR REPLACE FUNCTION public.decrement_stock_on_shipped()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'shipped' AND OLD.status IS DISTINCT FROM 'shipped' THEN
    UPDATE public.products AS p
    SET stock = GREATEST(p.stock - oi.quantity, 0)
    FROM public.order_items AS oi
    WHERE oi.order_id = NEW.id
      AND p.id = oi.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_shipped
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_stock_on_shipped();
