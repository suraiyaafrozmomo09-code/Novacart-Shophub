-- ===========================================
-- ShopHub Product Catalog Seed Data
-- ===========================================

-- ===========================================
-- SETUP: Auto-create user profiles on signup
-- ===========================================

-- Create a trigger function to auto-create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups (only if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- CREATE ADMIN USER (if you want to create an admin user)
-- Note: You need to manually set the password or use Supabase Auth API
-- The user below is created with placeholder credentials
-- ===========================================

-- ===========================================
-- ADMIN USER CREATION
-- ===========================================

-- For immediate admin access, create a user in Supabase Auth tab with:
-- Email: admin@shophub.com
-- Password: admin123456
-- Then run this to set them as admin:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@shophub.com';

-- Or to create an admin user directly via API (using service_role key):
-- Note: You need to use the service_role key from your Supabase project settings
-- 
-- Example via SQL (after creating user in Supabase Dashboard > Auth):
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- ===========================================
-- QUICK ADMIN SETUP (run after migrations)
-- ===========================================
-- After registering at /register, get your user UUID from auth.users:
-- Then run this in SQL editor to make yourself admin:
-- UPDATE users SET role = 'admin' WHERE id = '<your-user-uuid>';
-- 
-- Or to allow any authenticated user to become admin (for testing only):
-- UPDATE users SET role = 'admin' WHERE email = '<your-email>';

-- ===========================================
-- 1. SUB-CATEGORIES
-- ===========================================

INSERT INTO categories (name, slug, description, parent_id)
VALUES
  ('Shirt', 'mens-shirts', 'Classic and casual shirts for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('T-Shirt', 'mens-tshirts', 'Comfortable t-shirts for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('Panjabi', 'mens-panjabis', 'Traditional panjabis for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('Pajama', 'mens-pajamas', 'Comfortable pajamas for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('Pants', 'mens-pants', 'Formal and casual pants for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('Shorts', 'mens-shorts', 'Casual shorts for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('Kurti', 'womens-kurtis', 'Traditional kurtis for women', (SELECT id FROM categories WHERE slug = 'womens-clothing')),
  ('Pajama', 'womens-pajamas', 'Comfortable pajamas for women', (SELECT id FROM categories WHERE slug = 'womens-clothing')),
  ('Tops', 'womens-tops', 'Trendy tops for women', (SELECT id FROM categories WHERE slug = 'womens-clothing')),
  ('Three Piece', 'womens-three-piece', 'Elegant three-piece sets', (SELECT id FROM categories WHERE slug = 'womens-clothing')),
  ('Two Piece', 'womens-two-piece', 'Stylish two-piece sets', (SELECT id FROM categories WHERE slug = 'womens-clothing')),
  ('Loafer', 'mens-loafers', 'Classic loafers for men', (SELECT id FROM categories WHERE slug = 'mens-shoes')),
  ('Sandal', 'mens-sandals', 'Comfortable sandals for men', (SELECT id FROM categories WHERE slug = 'mens-shoes')),
  ('Socks', 'mens-socks', 'Quality socks for men', (SELECT id FROM categories WHERE slug = 'mens-shoes')),
  ('Other Shoe Products', 'mens-other-shoes', 'Other footwear for men', (SELECT id FROM categories WHERE slug = 'mens-shoes')),
  ('Heel', 'womens-heels', 'Stylish heels for women', (SELECT id FROM categories WHERE slug = 'womens-shoes')),
  ('Sandal', 'womens-sandals', 'Comfortable sandals for women', (SELECT id FROM categories WHERE slug = 'womens-shoes')),
  ('Socks', 'womens-socks', 'Quality socks for women', (SELECT id FROM categories WHERE slug = 'womens-shoes')),
  ('Other Shoe Products', 'womens-other-shoes', 'Other footwear for women', (SELECT id FROM categories WHERE slug = 'womens-shoes')),
  ('Men''s Watches', 'mens-watches', 'Stylish watches for men', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Women''s Watches', 'womens-watches', 'Elegant watches for women', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Men''s Perfumes', 'mens-perfumes', 'Premium perfumes for men', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Women''s Perfumes', 'womens-perfumes', 'Fragrant perfumes for women', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Phones', 'electronics-phones', 'Smartphones from top brands', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Headphones', 'electronics-headphones', 'High-quality headphones', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Earbuds', 'electronics-earbuds', 'Wireless earbuds', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Chargers', 'electronics-chargers', 'Chargers and adapters', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Fans', 'electronics-fans', 'Cooling fans', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Cables', 'electronics-cables', 'Data and charging cables', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Power Banks', 'electronics-powerbanks', 'Portable power banks', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Other Electronic Products', 'electronics-other', 'Other electronic gadgets', (SELECT id FROM categories WHERE slug = 'electronics'))
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- 2. BABY CLOTHES PRODUCTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Baby Cotton Onesie') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Baby Cotton Onesie', 'Soft cotton onesie perfect for everyday wear', id, 'BabySoft', 'active', 'unisex', 'baby-clothes', NULL, 4.8, 25
    FROM categories WHERE slug = 'baby-clothes';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Baby Romper Suit') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Baby Romper Suit', 'Adorable romper suit for active babies', id, 'TinyTots', 'active', 'unisex', 'baby-clothes', NULL, 4.6, 18
    FROM categories WHERE slug = 'baby-clothes';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Baby Winter Jacket') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Baby Winter Jacket', 'Warm and cozy winter jacket for babies', id, 'BabySoft', 'active', 'unisex', 'baby-clothes', NULL, 4.7, 12
    FROM categories WHERE slug = 'baby-clothes';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Baby Cotton Leggings') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Baby Cotton Leggings', 'Soft stretchy cotton leggings for comfortable playtime', id, 'BabySoft', 'active', 'unisex', 'baby-clothes', NULL, 4.8, 15
    FROM categories WHERE slug = 'baby-clothes';
  END IF;
END $$;

-- Baby Cotton Onesie variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '0-3M', 'Pink', 350, 50, 'BABY-ONESIE-001', 'https://images.unsplash.com/photo-1522775335684-37898b6baf30?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Cotton Onesie'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '0-3M', 'Blue', 350, 40, 'BABY-ONESIE-002', 'https://images.unsplash.com/photo-1522775335684-37898b6baf30?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Cotton Onesie'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '0-6M', 'White', 400, 45, 'BABY-ONESIE-003', 'https://images.unsplash.com/photo-1522775335684-37898b6baf30?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Cotton Onesie'
ON CONFLICT (sku) DO NOTHING;

-- Baby Romper Suit variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '0-6M', 'Yellow', 450, 35, 'BABY-ROMPER-001', 'https://images.unsplash.com/photo-1597514660025-1959f53b1f4b?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Romper Suit'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '6-12M', 'White', 550, 25, 'BABY-ROMPER-002', 'https://images.unsplash.com/photo-1597514660025-1959f53b1f4b?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Romper Suit'
ON CONFLICT (sku) DO NOTHING;

-- Baby Winter Jacket variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '6-12M', 'Navy', 750, 20, 'BABY-JACKET-001', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Winter Jacket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '12-18M', 'Grey', 850, 15, 'BABY-JACKET-002', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Winter Jacket'
ON CONFLICT (sku) DO NOTHING;

-- Baby Cotton Leggings variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '0-6M', 'White', 350, 40, 'BABY-LEGG-001', 'https://images.unsplash.com/photo-1519238263532-9c9e6e6e6e6e?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Cotton Leggings'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '6-12M', 'Grey', 400, 35, 'BABY-LEGG-002', 'https://images.unsplash.com/photo-1519238263532-9c9e6e6e6e6e?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Cotton Leggings'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '12-18M', 'Navy', 450, 30, 'BABY-LEGG-003', 'https://images.unsplash.com/photo-1519238263532-9c9e6e6e6e6e?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Baby Cotton Leggings'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- MEN'S CLOTHING - SHIRTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic Cotton Shirt') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Classic Cotton Shirt', 'Premium cotton shirt for everyday office and casual wear', id, 'GentlemansWear', 'active', 'male', 'clothing', 'shirt', 4.5, 32
    FROM categories WHERE slug = 'mens-shirts';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Flannel Check Shirt') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Flannel Check Shirt', 'Warm flannel shirt with classic check pattern', id, 'GentlemansWear', 'active', 'male', 'clothing', 'shirt', 4.4, 18
    FROM categories WHERE slug = 'mens-shirts';
  END IF;
END $$;

-- Shirt variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'White', 1200, 45, 'MSHIRT-001', 'https://images.unsplash.com/photo-1603257395605-2cc1ada02745?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Classic Cotton Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'White', 1200, 50, 'MSHIRT-002', 'https://images.unsplash.com/photo-1603257395605-2cc1ada02745?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Classic Cotton Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Light Blue', 1350, 35, 'MSHIRT-003', 'https://images.unsplash.com/photo-1594954767700-628f0f040a6c?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Classic Cotton Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Red/Black', 1500, 30, 'MSHIRT-004', 'https://images.unsplash.com/photo-1594954767700-628f0f040a6c?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Flannel Check Shirt'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- MEN'S CLOTHING - T-SHIRTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Premium Cotton T-Shirt') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Premium Cotton T-Shirt', 'Soft and comfortable cotton t-shirt for daily wear', id, 'UrbanStyle', 'active', 'male', 'clothing', 't-shirt', 4.6, 45
    FROM categories WHERE slug = 'mens-tshirts';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'White', 550, 100, 'MTEE-001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Cotton T-Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'White', 550, 120, 'MTEE-002', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Cotton T-Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Black', 650, 80, 'MTEE-003', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Cotton T-Shirt'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- MEN'S CLOTHING - PANJABI
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Traditional Cotton Panjabi') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Traditional Cotton Panjabi', 'Elegant cotton panjabi for special occasions', id, 'RoyalThreads', 'active', 'male', 'clothing', 'panjabi', 4.7, 15
    FROM categories WHERE slug = 'mens-panjabis';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'White', 2200, 30, 'MPANJ-001', 'https://images.unsplash.com/photo-1620012253295-c15cc3e65d4c?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Traditional Cotton Panjabi'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'White', 2200, 25, 'MPANJ-002', 'https://images.unsplash.com/photo-1620012253295-c15cc3e65d4c?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Traditional Cotton Panjabi'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Cream', 2800, 20, 'MPANJ-003', 'https://images.unsplash.com/photo-1617123151875-0adda5efbf3b?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Traditional Cotton Panjabi'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- MEN'S CLOTHING - PANTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Slim Fit Chinos') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Slim Fit Chinos', 'Modern slim fit chinos for a stylish look', id, 'GentlemansWear', 'active', 'male', 'clothing', 'pants', 4.4, 28
    FROM categories WHERE slug = 'mens-pants';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Formal Dress Pants') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Formal Dress Pants', 'Elegant formal pants for office and events', id, 'GentlemansWear', 'active', 'male', 'clothing', 'pants', 4.5, 20
    FROM categories WHERE slug = 'mens-pants';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '30', 'Khaki', 1600, 40, 'MPANTS-001', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Slim Fit Chinos'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '32', 'Khaki', 1600, 45, 'MPANTS-002', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Slim Fit Chinos'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- MEN'S CLOTHING - SHORTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Casual Cotton Shorts') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Casual Cotton Shorts', 'Lightweight cotton shorts perfect for summer', id, 'UrbanStyle', 'active', 'male', 'clothing', 'shorts', 4.3, 22
    FROM categories WHERE slug = 'mens-shorts';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Khaki', 750, 50, 'MSHORT-001', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Casual Cotton Shorts'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- WOMEN'S CLOTHING - KURTIS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Embroidered Cotton Kurti') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Embroidered Cotton Kurti', 'Beautiful embroidered kurti for daily wear', id, 'DesiGlow', 'active', 'female', 'clothing', 'kurti', 4.7, 35
    FROM categories WHERE slug = 'womens-kurtis';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Pink', 1200, 40, 'WKURTI-001', 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Embroidered Cotton Kurti'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- WOMEN'S CLOTHING - TOPS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Casual Printed Top') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Casual Printed Top', 'Trendy printed top for casual outings', id, 'UrbanChic', 'active', 'female', 'clothing', 'tops', 4.4, 30
    FROM categories WHERE slug = 'womens-tops';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Multi', 650, 60, 'WTOP-001', 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Casual Printed Top'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- WOMEN'S CLOTHING - TWO PIECE
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Designer Two Piece Set') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Designer Two Piece Set', 'Elegant two piece set with dupatta', id, 'RoyaleFemme', 'active', 'female', 'clothing', 'two-piece', 4.6, 18
    FROM categories WHERE slug = 'womens-two-piece';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Maroon', 2800, 25, 'W2PCE-001', 'https://images.unsplash.com/photo-1610030181423-929793d43147?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Designer Two Piece Set'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- ACCESSORIES - WATCHES
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic Analog Watch') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Classic Analog Watch', 'Timeless analog watch with leather strap', id, 'TimeCraft', 'active', 'unisex', 'accessories', 'watch', 4.6, 40
    FROM categories WHERE slug = 'mens-watches';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Elegant Women''s Watch') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Elegant Women''s Watch', 'Chic women''s watch with stainless steel band', id, 'TimeCraft', 'active', 'female', 'accessories', 'watch', 4.7, 33
    FROM categories WHERE slug = 'womens-watches';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Brown/Black', 5000, 50, 'MWATCH-001', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Classic Analog Watch'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- ACCESSORIES - PERFUMES
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Premium Men''s Perfume') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Premium Men''s Perfume', 'Long-lasting fresh fragrance for men', id, 'ScentCraft', 'active', 'male', 'accessories', 'perfume', 4.5, 25
    FROM categories WHERE slug = 'mens-perfumes';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '100ml', NULL, 2500, 60, 'MPERF-001', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Men''s Perfume'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- ELECTRONICS - PHONES
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'iPhone 15 Pro Max') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'iPhone 15 Pro Max', 'Latest Apple smartphone with A17 Pro chip', id, 'Apple', 'active', 'unisex', 'electronics', 'phones', 4.9, 85
    FROM categories WHERE slug = 'electronics-phones';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '256GB', 'Natural Titanium', 65000, 25, 'IPHONE-001', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'iPhone 15 Pro Max'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- ELECTRONICS - OTHER
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Mouse') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Wireless Mouse', 'Ergonomic wireless mouse for computers', id, 'TechPro', 'active', 'unisex', 'electronics', 'other', 4.3, 40
    FROM categories WHERE slug = 'electronics-other';
  END IF;
END $$;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Black', 800, 60, 'MOUSE-001', 'https://images.unsplash.com/photo-1615664610493-559c4c0b1c5c?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Wireless Mouse'
ON CONFLICT (sku) DO NOTHING;