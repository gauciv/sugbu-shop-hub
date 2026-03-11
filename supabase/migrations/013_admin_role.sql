-- Expand role check constraint to include 'admin'
ALTER TABLE public.profiles
  DROP CONSTRAINT profiles_role_check,
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('buyer', 'seller', 'admin'));

-- Admin bypass policies — additive, existing policies are unchanged

-- PROFILES: admin can do everything
CREATE POLICY "Admin full access to profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SHOPS: admin can view/update all shops (including inactive)
CREATE POLICY "Admin full access to shops"
  ON public.shops FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PRODUCTS: admin can view/update/delete all products
CREATE POLICY "Admin full access to products"
  ON public.products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ORDERS: admin can view and force-update all orders
CREATE POLICY "Admin full access to orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ORDER ITEMS: admin can view all order items
CREATE POLICY "Admin full access to order items"
  ON public.order_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- CATEGORIES: admin can insert/update/delete categories
CREATE POLICY "Admin can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
