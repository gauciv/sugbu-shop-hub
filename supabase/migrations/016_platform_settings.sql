CREATE TABLE public.platform_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default commission rate of 5%
INSERT INTO public.platform_settings (key, value)
VALUES ('commission_rate', '5')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (used for display to sellers, etc.)
CREATE POLICY "Anyone can read settings"
  ON public.platform_settings FOR SELECT USING (true);

-- Only admin can update settings
CREATE POLICY "Admin can update settings"
  ON public.platform_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
