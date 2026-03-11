-- Add approval_status column to shops
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'suspended'));

-- Retroactively approve all existing shops (they predate the approval system)
UPDATE public.shops
  SET approval_status = 'approved'
  WHERE approval_status = 'pending';

-- New shops now default to inactive, pending admin approval
ALTER TABLE public.shops
  ALTER COLUMN is_active SET DEFAULT false;

-- Index for fast pending-shop queries
CREATE INDEX idx_shops_approval ON public.shops(approval_status);
