-- Add suspension flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_suspended ON public.profiles(is_suspended);
