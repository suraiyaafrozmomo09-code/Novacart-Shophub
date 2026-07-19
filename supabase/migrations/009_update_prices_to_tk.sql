-- ===========================================
-- NovaCart: Price & Image Fix Migration
-- ===========================================
-- Safety net for any leftover issues. All
-- migrations now use realistic TK prices.
-- This handles any previously-applied data.
-- ===========================================

-- Convert any remaining old USD prices to TK
UPDATE public.product_variants
SET price = ROUND(price * 122)
WHERE price > 0 AND price < 100;

-- Cap prices at 90,000 TK max (safety net)
UPDATE public.product_variants
SET price = 90000
WHERE price > 90000;

-- Fix Elegant Women's Watch image (was shared)
UPDATE public.product_variants
SET image = 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop'
WHERE sku = 'WWATCH-001' AND image IS NULL;

-- Fix Wireless Noise-Cancel Headphones image (was NULL)
UPDATE public.product_variants
SET image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
WHERE sku = 'HEAD-001' AND image IS NULL;

-- Fix Pocket Bluetooth Earbuds image (was NULL)
UPDATE public.product_variants
SET image = 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop'
WHERE sku = 'EAR-001' AND image IS NULL;

-- Fix remaining NULL variant images with product-appropriate defaults
UPDATE public.product_variants pv
SET image = CASE
  WHEN sku LIKE 'MTEE-%' THEN 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
  WHEN sku LIKE 'MJEAN-%' THEN 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'
  WHEN sku LIKE 'MPANJ-00%' THEN 'https://images.unsplash.com/photo-1620012253295-c15cc3e65d4c?w=400&h=400&fit=crop'
  WHEN sku LIKE 'MPAJ-%' THEN 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop'
  WHEN sku LIKE 'WHEEL-%' THEN 'https://images.unsplash.com/photo-1543168256-418811576931?w=400&h=400&fit=crop'
  WHEN sku LIKE 'WSAND-%' THEN 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=400&fit=crop'
  WHEN sku LIKE 'WPERF-%' THEN 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop'
  WHEN sku LIKE 'WWATCH-%' THEN 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop'
  WHEN sku LIKE 'CHAR-%' THEN 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=400&fit=crop'
  WHEN sku LIKE 'PBANK-%' THEN 'https://images.unsplash.com/photo-1609592424658-2e1d18a49eef?w=400&h=400&fit=crop'
  WHEN sku LIKE 'EAR-%' THEN 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop'
  ELSE pv.image
END
WHERE pv.image IS NULL;
