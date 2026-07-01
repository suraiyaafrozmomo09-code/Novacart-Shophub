-- Fix recursive admin checks in RLS policies.
-- The previous policies queried `users` from inside policies that also applied to
-- `users`, which caused "infinite recursion detected in policy for relation
-- users" and broke reads for categories/products.

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = COALESCE(check_user_id, auth.uid())
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
CREATE POLICY "Only admins can manage categories"
ON public.categories
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
CREATE POLICY "Only admins can manage products"
ON public.products
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Variants are viewable by everyone" ON public.product_variants;
CREATE POLICY "Variants are viewable by everyone"
ON public.product_variants
FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.products
    WHERE id = product_id
      AND status = 'active'
  )
);

DROP POLICY IF EXISTS "Only admins can manage variants" ON public.product_variants;
CREATE POLICY "Only admins can manage variants"
ON public.product_variants
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders"
ON public.orders
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items"
ON public.order_items
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
CREATE POLICY "Admins can manage all payments"
ON public.payments
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Search logs are viewable by admins" ON public.search_logs;
CREATE POLICY "Search logs are viewable by admins"
ON public.search_logs
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Click events are viewable by admins" ON public.click_events;
CREATE POLICY "Click events are viewable by admins"
ON public.click_events
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND public.is_admin()
);
