-- =============================================================================
-- Fix: infinite recursion in RLS policies caused by "Admin full access to
-- profiles" querying public.profiles from within a policy on public.profiles.
-- Every authenticated query hit this recursion (not just admin queries) because
-- PostgreSQL evaluates ALL applicable policies before deciding which rows pass.
--
-- Solution: replace the `EXISTS (SELECT 1 FROM public.profiles …)` pattern in
-- ALL admin policies with a SECURITY DEFINER helper function that reads the
-- role outside of RLS, breaking the recursive cycle.
-- =============================================================================

-- Helper: returns the current user's role without triggering RLS.
-- SECURITY DEFINER runs as the function owner (postgres), so the internal
-- SELECT on public.profiles bypasses RLS and never re-enters the policy loop.
CREATE OR REPLACE FUNCTION public.get_my_role()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ─── profiles ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access to profiles" ON public.profiles;

CREATE POLICY "Admin full access to profiles"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── shops ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access to shops" ON public.shops;

CREATE POLICY "Admin full access to shops"
  ON public.shops FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── products ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access to products" ON public.products;

CREATE POLICY "Admin full access to products"
  ON public.products FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── orders (two admin policies exist) ───────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can update order payout_id" ON public.orders;

CREATE POLICY "Admin full access to orders"
  ON public.orders FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── order_items ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access to order items" ON public.order_items;

CREATE POLICY "Admin full access to order items"
  ON public.order_items FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── categories ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;

CREATE POLICY "Admin can manage categories"
  ON public.categories FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── platform_settings ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin can update settings" ON public.platform_settings;

CREATE POLICY "Admin can update settings"
  ON public.platform_settings FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- ─── payouts ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access to payouts" ON public.payouts;

CREATE POLICY "Admin full access to payouts"
  ON public.payouts FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── support_tickets ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access to tickets" ON public.support_tickets;

CREATE POLICY "Admin full access to tickets"
  ON public.support_tickets FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── ticket_messages (admin check is embedded inside participant policies) ────
DROP POLICY IF EXISTS "Ticket participants can view messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Ticket participants can send messages" ON public.ticket_messages;

CREATE POLICY "Ticket participants can view messages"
  ON public.ticket_messages FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.support_tickets WHERE submitted_by = auth.uid()
    )
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "Ticket participants can send messages"
  ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND (
      ticket_id IN (
        SELECT id FROM public.support_tickets WHERE submitted_by = auth.uid()
      )
      OR public.get_my_role() = 'admin'
    )
  );
