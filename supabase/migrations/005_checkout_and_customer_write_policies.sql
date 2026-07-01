-- ===========================================
-- ShopHub checkout and customer write policies
-- ===========================================
-- This migration fixes customer write flows that were blocked by incomplete
-- RLS policies and adds a secure checkout RPC for placing orders from cart.

-- -------------------------------------------
-- CART POLICIES
-- -------------------------------------------
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can insert own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can update own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can delete own cart" ON public.cart;

CREATE POLICY "Users can insert own cart"
ON public.cart
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
ON public.cart
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
ON public.cart
FOR DELETE
USING (auth.uid() = user_id);

-- -------------------------------------------
-- ORDER POLICIES
-- -------------------------------------------
DROP POLICY IF EXISTS "Users can cancel own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own pending orders" ON public.orders;

CREATE POLICY "Users can insert own orders"
ON public.orders
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND payment_method IN ('online', 'cod')
  AND payment_status IN ('pending', 'paid', 'failed')
  AND status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
);

CREATE POLICY "Users can update own pending orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------
-- ORDER ITEM POLICIES
-- -------------------------------------------
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

CREATE POLICY "Users can insert own order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);

-- -------------------------------------------
-- PAYMENT POLICIES
-- -------------------------------------------
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;

CREATE POLICY "Users can insert own payments"
ON public.payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- -------------------------------------------
-- CHECKOUT RPC
-- -------------------------------------------
CREATE OR REPLACE FUNCTION public.place_order_from_cart(
  p_shipping_address JSONB,
  p_payment_method TEXT DEFAULT 'cod'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_id UUID;
  v_subtotal NUMERIC(12,2) := 0;
  v_shipping_fee NUMERIC(12,2) := 0;
  cart_record RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_payment_method NOT IN ('online', 'cod') THEN
    RAISE EXCEPTION 'Unsupported payment method';
  END IF;

  IF COALESCE(NULLIF(TRIM(p_shipping_address ->> 'full_name'), ''), '') = ''
    OR COALESCE(NULLIF(TRIM(p_shipping_address ->> 'phone'), ''), '') = ''
    OR COALESCE(NULLIF(TRIM(p_shipping_address ->> 'address_line1'), ''), '') = ''
    OR COALESCE(NULLIF(TRIM(p_shipping_address ->> 'city'), ''), '') = ''
    OR COALESCE(NULLIF(TRIM(p_shipping_address ->> 'state'), ''), '') = ''
    OR COALESCE(NULLIF(TRIM(p_shipping_address ->> 'zip_code'), ''), '') = ''
  THEN
    RAISE EXCEPTION 'Incomplete shipping address';
  END IF;

  FOR cart_record IN
    SELECT
      c.id AS cart_id,
      c.quantity AS cart_quantity,
      v.id AS variant_id,
      v.price,
      v.quantity AS stock_quantity,
      p.id AS product_id
    FROM public.cart AS c
    JOIN public.product_variants AS v ON v.id = c.variant_id
    JOIN public.products AS p ON p.id = v.product_id
    WHERE c.user_id = v_user_id
    FOR UPDATE OF c, v
  LOOP
    IF cart_record.stock_quantity < cart_record.cart_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for variant %', cart_record.variant_id;
    END IF;

    v_subtotal := v_subtotal + (cart_record.price * cart_record.cart_quantity);
  END LOOP;

  IF v_subtotal <= 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  v_shipping_fee := CASE WHEN v_subtotal > 50 THEN 0 ELSE 5.99 END;

  INSERT INTO public.orders (
    user_id,
    total_amount,
    status,
    payment_method,
    payment_status,
    shipping_address
  )
  VALUES (
    v_user_id,
    v_subtotal + v_shipping_fee,
    'pending',
    p_payment_method,
    CASE WHEN p_payment_method = 'online' THEN 'paid' ELSE 'pending' END,
    p_shipping_address
  )
  RETURNING id INTO v_order_id;

  FOR cart_record IN
    SELECT
      c.id AS cart_id,
      c.quantity AS cart_quantity,
      v.id AS variant_id,
      v.price,
      p.id AS product_id
    FROM public.cart AS c
    JOIN public.product_variants AS v ON v.id = c.variant_id
    JOIN public.products AS p ON p.id = v.product_id
    WHERE c.user_id = v_user_id
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      variant_id,
      quantity,
      price
    )
    VALUES (
      v_order_id,
      cart_record.product_id,
      cart_record.variant_id,
      cart_record.cart_quantity,
      cart_record.price
    );

    UPDATE public.product_variants
    SET quantity = quantity - cart_record.cart_quantity
    WHERE id = cart_record.variant_id;
  END LOOP;

  INSERT INTO public.payments (
    order_id,
    user_id,
    amount,
    method,
    status
  )
  VALUES (
    v_order_id,
    v_user_id,
    v_subtotal + v_shipping_fee,
    p_payment_method,
    CASE WHEN p_payment_method = 'online' THEN 'completed' ELSE 'pending' END
  );

  DELETE FROM public.cart
  WHERE user_id = v_user_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order_from_cart(JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order_from_cart(JSONB, TEXT) TO authenticated, service_role;
