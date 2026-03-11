-- Add payout_id to orders to track which orders are included in a payout
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payout_id uuid;

CREATE INDEX idx_orders_payout ON public.orders(payout_id);

-- Payouts table: tracks disbursements from platform to each seller
CREATE TABLE public.payouts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  shop_id          uuid NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
  period_label     text NOT NULL,
  gross_amount     numeric(12,2) NOT NULL,
  commission_rate  numeric(5,2) NOT NULL,
  commission_amount numeric(12,2) NOT NULL,
  net_amount       numeric(12,2) NOT NULL,
  status           text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid')),
  transaction_ref  text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  paid_at          timestamptz,
  paid_by          uuid REFERENCES public.profiles(id)
);

CREATE INDEX idx_payouts_shop    ON public.payouts(shop_id);
CREATE INDEX idx_payouts_status  ON public.payouts(status);
CREATE INDEX idx_payouts_seller  ON public.payouts(seller_id);

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to payouts"
  ON public.payouts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Sellers can view own payouts"
  ON public.payouts FOR SELECT
  USING (seller_id = auth.uid());

-- Allow admin to update payout_id on orders
CREATE POLICY "Admin can update order payout_id"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
