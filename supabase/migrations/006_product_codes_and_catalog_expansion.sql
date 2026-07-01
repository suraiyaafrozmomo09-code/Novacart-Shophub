-- ===========================================
-- Product codes and catalog expansion
-- ===========================================

-- -------------------------------------------
-- Stable product codes for every product
-- -------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.product_code_seq START WITH 1001;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_code TEXT;

CREATE OR REPLACE FUNCTION public.assign_product_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.product_code IS NULL OR BTRIM(NEW.product_code) = '' THEN
    NEW.product_code := 'PRD-' || LPAD(nextval('public.product_code_seq')::TEXT, 6, '0');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_product_code_trigger ON public.products;
CREATE TRIGGER assign_product_code_trigger
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.assign_product_code();

WITH ordered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, name, id) AS rn
  FROM public.products
  WHERE product_code IS NULL OR BTRIM(product_code) = ''
)
UPDATE public.products AS p
SET product_code = 'PRD-' || LPAD((1000 + ordered_products.rn)::TEXT, 6, '0')
FROM ordered_products
WHERE p.id = ordered_products.id;

SELECT setval(
  'public.product_code_seq',
  GREATEST(
    COALESCE((SELECT MAX(CAST(SUBSTRING(product_code FROM 5) AS BIGINT)) FROM public.products WHERE product_code ~ '^PRD-[0-9]+$'), 1000),
    1000
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_code_unique ON public.products(product_code);

-- -------------------------------------------
-- Expanded catalog products
-- -------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Minimal Graphic T-Shirt') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Minimal Graphic T-Shirt', 'Soft cotton tee with a clean premium graphic print.', id, 'UrbanStyle', 'active', 'male', 'clothing', 't-shirt', 4.5, 22
    FROM categories WHERE slug = 'mens-tshirts';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic Denim Jeans') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Classic Denim Jeans', 'Straight-fit denim jeans for daily wear.', id, 'GentlemansWear', 'active', 'male', 'clothing', 'pants', 4.6, 19
    FROM categories WHERE slug = 'mens-pants';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Festival Embroidered Panjabi') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Festival Embroidered Panjabi', 'Traditional festive panjabi with subtle embroidery.', id, 'RoyalThreads', 'active', 'male', 'clothing', 'panjabi', 4.8, 14
    FROM categories WHERE slug = 'mens-panjabis';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Comfort Pajama Bottom') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Comfort Pajama Bottom', 'Lightweight pajama bottoms with breathable fabric.', id, 'RoyalThreads', 'active', 'male', 'clothing', 'pajama', 4.3, 11
    FROM categories WHERE slug = 'mens-pajamas';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Elegant Heel Sandal') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Elegant Heel Sandal', 'Polished heel sandal designed for parties and events.', id, 'UrbanChic', 'active', 'female', 'footwear', 'heel', 4.6, 17
    FROM categories WHERE slug = 'womens-heels';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Daily Comfort Sandal') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Daily Comfort Sandal', 'Comfort-first sandal for everyday walking.', id, 'UrbanChic', 'active', 'female', 'footwear', 'sandal', 4.4, 16
    FROM categories WHERE slug = 'womens-sandals';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Luxury Rose Perfume') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Luxury Rose Perfume', 'Floral signature perfume with a soft premium finish.', id, 'ScentCraft', 'active', 'female', 'accessories', 'perfume', 4.7, 24
    FROM categories WHERE slug = 'womens-perfumes';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Crystal Dial Women''s Watch') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Crystal Dial Women''s Watch', 'Elegant everyday watch with a crystal-finished dial.', id, 'TimeCraft', 'active', 'female', 'accessories', 'watch', 4.8, 20
    FROM categories WHERE slug = 'womens-watches';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Noise-Cancel Headphones') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Wireless Noise-Cancel Headphones', 'Over-ear headphones with immersive sound and clean bass.', id, 'TechPro', 'active', 'unisex', 'electronics', 'headphones', 4.7, 31
    FROM categories WHERE slug = 'electronics-headphones';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pocket Bluetooth Earbuds') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Pocket Bluetooth Earbuds', 'Compact earbuds with stable wireless connectivity.', id, 'TechPro', 'active', 'unisex', 'electronics', 'earbuds', 4.5, 28
    FROM categories WHERE slug = 'electronics-earbuds';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Fast Charge Adapter 33W') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Fast Charge Adapter 33W', 'Compact wall charger with fast-charging support.', id, 'PowerLab', 'active', 'unisex', 'electronics', 'charger', 4.4, 18
    FROM categories WHERE slug = 'electronics-chargers';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Slim Power Bank 10000mAh') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Slim Power Bank 10000mAh', 'Portable power bank with lightweight travel-friendly design.', id, 'PowerLab', 'active', 'unisex', 'electronics', 'powerbank', 4.6, 26
    FROM categories WHERE slug = 'electronics-powerbanks';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Black', 18.99, 70, 'MTEE-004', NULL
FROM products p WHERE p.name = 'Minimal Graphic T-Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Olive', 18.99, 55, 'MTEE-005', NULL
FROM products p WHERE p.name = 'Minimal Graphic T-Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '32', 'Navy', 42.99, 36, 'MJEAN-001', NULL
FROM products p WHERE p.name = 'Classic Denim Jeans'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '34', 'Deep Blue', 42.99, 32, 'MJEAN-002', NULL
FROM products p WHERE p.name = 'Classic Denim Jeans'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Maroon', 49.99, 18, 'MPANJ-004', NULL
FROM products p WHERE p.name = 'Festival Embroidered Panjabi'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Bottle Green', 52.99, 14, 'MPANJ-005', NULL
FROM products p WHERE p.name = 'Festival Embroidered Panjabi'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Grey', 16.99, 28, 'MPAJ-001', NULL
FROM products p WHERE p.name = 'Comfort Pajama Bottom'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '38', 'Black', 44.99, 22, 'WHEEL-001', NULL
FROM products p WHERE p.name = 'Elegant Heel Sandal'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '39', 'Beige', 44.99, 18, 'WHEEL-002', NULL
FROM products p WHERE p.name = 'Elegant Heel Sandal'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '38', 'Tan', 24.99, 34, 'WSAND-001', NULL
FROM products p WHERE p.name = 'Daily Comfort Sandal'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '100ml', NULL, 39.99, 30, 'WPERF-001', NULL
FROM products p WHERE p.name = 'Luxury Rose Perfume'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Rose Gold', 69.99, 20, 'WWATCH-001', NULL
FROM products p WHERE p.name = 'Crystal Dial Women''s Watch'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Matte Black', 89.99, 27, 'HEAD-001', NULL
FROM products p WHERE p.name = 'Wireless Noise-Cancel Headphones'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'White', 39.99, 44, 'EAR-001', NULL
FROM products p WHERE p.name = 'Pocket Bluetooth Earbuds'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '33W', 'White', 19.99, 60, 'CHAR-001', NULL
FROM products p WHERE p.name = 'Fast Charge Adapter 33W'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '10000mAh', 'Black', 29.99, 42, 'PBANK-001', NULL
FROM products p WHERE p.name = 'Slim Power Bank 10000mAh'
ON CONFLICT (sku) DO NOTHING;
