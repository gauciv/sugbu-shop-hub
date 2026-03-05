-- Migration: add return_requested status and buyer update policy

-- 1. Update the status CHECK constraint to include return_requested
ALTER TABLE public.orders
  DROP CONSTRAINT orders_status_check,
  ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending','confirmed','preparing','shipped','delivered','cancelled','return_requested'));

-- 2. Allow buyers to update their own orders (for pay, complete, return actions)
CREATE POLICY "Buyers can update own orders"
  ON public.orders FOR UPDATE USING (buyer_id = auth.uid());
