-- ===========================================
-- NovaCart Catalog Expansion 008
-- New categories, subcategories, and products
-- ===========================================

-- ===========================================
-- 1. NEW SUB-CATEGORIES
-- ===========================================

-- Men's new subcategories
INSERT INTO categories (name, slug, description, parent_id)
VALUES
  ('Jackets', 'mens-jackets', 'Stylish jackets for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('Hoodies', 'mens-hoodies', 'Comfortable hoodies for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('Sweaters', 'mens-sweaters', 'Warm sweaters for men', (SELECT id FROM categories WHERE slug = 'mens-clothing')),
  ('Blazers', 'mens-blazers', 'Formal blazers for men', (SELECT id FROM categories WHERE slug = 'mens-clothing'))
ON CONFLICT (slug) DO NOTHING;

-- Women's new subcategories
INSERT INTO categories (name, slug, description, parent_id)
VALUES
  ('Dresses', 'womens-dresses', 'Beautiful dresses for women', (SELECT id FROM categories WHERE slug = 'womens-clothing')),
  ('Leggings', 'womens-leggings', 'Comfortable leggings for women', (SELECT id FROM categories WHERE slug = 'womens-clothing')),
  ('Skirts', 'womens-skirts', 'Stylish skirts for women', (SELECT id FROM categories WHERE slug = 'womens-clothing'))
ON CONFLICT (slug) DO NOTHING;

-- Accessories new subcategories
INSERT INTO categories (name, slug, description, parent_id)
VALUES
  ('Sunglasses', 'sunglasses', 'Trendy sunglasses', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Belts', 'belts', 'Quality belts', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Wallets', 'wallets', 'Slim and classic wallets', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Bags', 'bags', 'Handbags, totes and more', (SELECT id FROM categories WHERE slug = 'accessories'))
ON CONFLICT (slug) DO NOTHING;

-- Electronics new subcategories
INSERT INTO categories (name, slug, description, parent_id)
VALUES
  ('Laptops', 'electronics-laptops', 'Laptops and ultrabooks', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Smartwatches', 'electronics-smartwatches', 'Smartwatches and fitness bands', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Bluetooth Speakers', 'electronics-speakers', 'Portable Bluetooth speakers', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Keyboards', 'electronics-keyboards', 'Mechanical and membrane keyboards', (SELECT id FROM categories WHERE slug = 'electronics')),
  ('Tablets', 'electronics-tablets', 'Tablets and iPads', (SELECT id FROM categories WHERE slug = 'electronics'))
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- 2. MEN'S JACKETS PRODUCTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Premium Leather Jacket') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Premium Leather Jacket', 'Genuine leather jacket with a sleek matte finish. Features a front zipper, stand collar, and quilted lining for timeless style and warmth.', id, 'GentlemansWear', 'active', 'male', 'clothing', 'jacket', 4.7, 28
    FROM categories WHERE slug = 'mens-jackets';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Lightweight Bomber Jacket') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Lightweight Bomber Jacket', 'A classic bomber silhouette in water-resistant fabric. Ribbed cuffs and hem keep the fit sharp and comfortable.', id, 'UrbanStyle', 'active', 'male', 'clothing', 'jacket', 4.5, 22
    FROM categories WHERE slug = 'mens-jackets';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic Pullover Hoodie') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Classic Pullover Hoodie', 'Heavyweight cotton-blend hoodie with a kangaroo pocket and adjustable drawstring hood. A wardrobe essential for casual layering.', id, 'UrbanStyle', 'active', 'male', 'clothing', 'hoodie', 4.6, 34
    FROM categories WHERE slug = 'mens-hoodies';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cashmere Blend Sweater') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Cashmere Blend Sweater', 'Luxuriously soft cashmere-merino wool crewneck sweater. Ribbed cuffs and hem with a relaxed fit for sophisticated comfort.', id, 'GentlemansWear', 'active', 'male', 'clothing', 'sweater', 4.8, 19
    FROM categories WHERE slug = 'mens-sweaters';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Slim Fit Blazer') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Slim Fit Blazer', 'Tailored two-button blazer with notch lapels and a lightweight stretch lining. Perfect for the office or evening occasions.', id, 'GentlemansWear', 'active', 'male', 'clothing', 'blazer', 4.8, 15
    FROM categories WHERE slug = 'mens-blazers';
  END IF;
END $$;

-- Premium Leather Jacket variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Black', 5500, 20, 'MJACK-001', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Leather Jacket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Black', 5500, 18, 'MJACK-002', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Leather Jacket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Brown', 6500, 12, 'MJACK-003', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Leather Jacket'
ON CONFLICT (sku) DO NOTHING;

-- Lightweight Bomber Jacket variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Navy', 4500, 30, 'MJACK-004', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Lightweight Bomber Jacket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Navy', 4500, 28, 'MJACK-005', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Lightweight Bomber Jacket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Olive', 5000, 20, 'MJACK-006', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Lightweight Bomber Jacket'
ON CONFLICT (sku) DO NOTHING;

-- Classic Pullover Hoodie variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Black', 1800, 50, 'MHOOD-001', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Classic Pullover Hoodie'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Grey', 1800, 45, 'MHOOD-002', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Classic Pullover Hoodie'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Navy', 2000, 35, 'MHOOD-003', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Classic Pullover Hoodie'
ON CONFLICT (sku) DO NOTHING;

-- Cashmere Blend Sweater variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Burgundy', 3500, 25, 'MSWTR-001', 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a10?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Cashmere Blend Sweater'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Charcoal', 3800, 22, 'MSWTR-002', 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a10?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Cashmere Blend Sweater'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Cream', 4200, 18, 'MSWTR-003', 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a10?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Cashmere Blend Sweater'
ON CONFLICT (sku) DO NOTHING;

-- Slim Fit Blazer variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Navy', 7500, 15, 'MBLAZ-001', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Slim Fit Blazer'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Navy', 7500, 14, 'MBLAZ-002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Slim Fit Blazer'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Black', 8500, 10, 'MBLAZ-003', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Slim Fit Blazer'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- 3. WOMEN'S DRESSES PRODUCTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Floral Summer Dress') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Floral Summer Dress', 'Lightweight floral-print dress with a flattering A-line silhouette. Adjustable tie waist and soft breathable fabric for warm-weather elegance.', id, 'UrbanChic', 'active', 'female', 'clothing', 'dress', 4.7, 42
    FROM categories WHERE slug = 'womens-dresses';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Evening Party Gown') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Evening Party Gown', 'Stunning floor-length gown with a fitted bodice and flowing skirt. Features delicate sequin embellishments for a glamorous party look.', id, 'RoyaleFemme', 'active', 'female', 'clothing', 'dress', 4.9, 31
    FROM categories WHERE slug = 'womens-dresses';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'High-Waist Yoga Leggings') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'High-Waist Yoga Leggings', 'Buttery-soft high-compression leggings with a wide waistband. Moisture-wicking four-way stretch fabric for studio-to-street versatility.', id, 'UrbanChic', 'active', 'female', 'clothing', 'leggings', 4.6, 38
    FROM categories WHERE slug = 'womens-leggings';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pleated Mini Skirt') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Pleated Mini Skirt', 'Chic pleated mini skirt with a smooth waistband and subtle A-line flare. Pairs beautifully with blouses, tees, or crop tops.', id, 'UrbanChic', 'active', 'female', 'clothing', 'skirt', 4.4, 26
    FROM categories WHERE slug = 'womens-skirts';
  END IF;
END $$;

-- Floral Summer Dress variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Blue Floral', 2800, 35, 'WDRES-001', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Floral Summer Dress'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Blue Floral', 2800, 40, 'WDRES-002', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Floral Summer Dress'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Pink Floral', 3200, 30, 'WDRES-003', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Floral Summer Dress'
ON CONFLICT (sku) DO NOTHING;

-- Evening Party Gown variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Black', 5500, 15, 'WGOWN-001', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Evening Party Gown'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Black', 5500, 18, 'WGOWN-002', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Evening Party Gown'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Red', 6500, 12, 'WGOWN-003', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Evening Party Gown'
ON CONFLICT (sku) DO NOTHING;

-- High-Waist Yoga Leggings variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Black', 1200, 60, 'WLEGG-001', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'High-Waist Yoga Leggings'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Black', 1200, 65, 'WLEGG-002', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'High-Waist Yoga Leggings'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Navy', 1400, 45, 'WLEGG-003', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'High-Waist Yoga Leggings'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Maroon', 1500, 35, 'WLEGG-004', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'High-Waist Yoga Leggings'
ON CONFLICT (sku) DO NOTHING;

-- Pleated Mini Skirt variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Black', 1500, 40, 'WSKRT-001', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Pleated Mini Skirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Black', 1500, 45, 'WSKRT-002', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Pleated Mini Skirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Khaki', 1800, 35, 'WSKRT-003', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Pleated Mini Skirt'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- 4. ACCESSORIES - SUNGLASSES, BELTS, WALLETS, BAGS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Aviator Sunglasses') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Aviator Sunglasses', 'Classic teardrop aviator sunglasses with UV400 protection and a lightweight metal frame. A timeless style icon.', id, 'VogueLook', 'active', 'unisex', 'accessories', 'sunglasses', 4.6, 33
    FROM categories WHERE slug = 'sunglasses';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Genuine Leather Belt') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Genuine Leather Belt', 'Full-grain leather belt with a polished brass buckle. Width tapers from 35mm at the buckle to 30mm at the tip.', id, 'GentlemansWear', 'active', 'male', 'accessories', 'belt', 4.7, 29
    FROM categories WHERE slug = 'belts';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'RFID Blocking Wallet') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'RFID Blocking Wallet', 'Slim bifold wallet with RFID-blocking technology. Holds up to 8 cards plus bill compartment in premium pebbled leather.', id, 'GentlemansWear', 'active', 'unisex', 'accessories', 'wallet', 4.5, 38
    FROM categories WHERE slug = 'wallets';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Canvas Tote Bag') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Canvas Tote Bag', 'Durable canvas tote with reinforced stitching and genuine leather handles. Interior zip pocket secures essentials.', id, 'UrbanChic', 'active', 'female', 'accessories', 'bag', 4.6, 27
    FROM categories WHERE slug = 'bags';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Leather Crossbody Bag') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Leather Crossbody Bag', 'Compact crossbody bag in soft pebbled leather with an adjustable strap and multiple interior compartments. Perfect for daily essentials.', id, 'RoyaleFemme', 'active', 'female', 'accessories', 'bag', 4.8, 21
    FROM categories WHERE slug = 'bags';
  END IF;
END $$;

-- Aviator Sunglasses variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Gold/Green', 2500, 35, 'SGLASS-001', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Aviator Sunglasses'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Black/Green', 3000, 30, 'SGLASS-002', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Aviator Sunglasses'
ON CONFLICT (sku) DO NOTHING;

-- Genuine Leather Belt variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '34', 'Black', 1500, 40, 'BELT-001', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Genuine Leather Belt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '36', 'Black', 1500, 38, 'BELT-002', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Genuine Leather Belt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '34', 'Brown', 1800, 30, 'BELT-003', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Genuine Leather Belt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '38', 'Brown', 2000, 25, 'BELT-004', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Genuine Leather Belt'
ON CONFLICT (sku) DO NOTHING;

-- RFID Blocking Wallet variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Black', 1200, 50, 'WALLET-001', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'RFID Blocking Wallet'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Brown', 1500, 35, 'WALLET-002', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'RFID Blocking Wallet'
ON CONFLICT (sku) DO NOTHING;

-- Canvas Tote Bag variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Natural', 1800, 28, 'BAG-001', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Canvas Tote Bag'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Black', 2000, 22, 'BAG-002', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Canvas Tote Bag'
ON CONFLICT (sku) DO NOTHING;

-- Leather Crossbody Bag variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Tan', 3500, 18, 'BAG-003', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Leather Crossbody Bag'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Black', 3800, 15, 'BAG-004', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Leather Crossbody Bag'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- 5. ELECTRONICS - LAPTOPS, SMARTWATCHES, SPEAKERS, KEYBOARDS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ultrabook Pro 14"') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Ultrabook Pro 14"', 'Slim 14-inch ultrabook with a 2.8K OLED display, Intel Core i7 processor, 16GB RAM, and a full-metal unibody chassis. Weighs just 1.2kg.', id, 'TechPro', 'active', 'unisex', 'electronics', 'laptop', 4.7, 52
    FROM categories WHERE slug = 'electronics-laptops';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Fitness Smart Watch') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Fitness Smart Watch', 'AMOLED smartwatch with heart-rate, SpO2, and sleep tracking. 100+ workout modes, GPS, and 14-day battery life in a sleek water-resistant design.', id, 'TechPro', 'active', 'unisex', 'electronics', 'smartwatch', 4.5, 65
    FROM categories WHERE slug = 'electronics-smartwatches';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Portable Bluetooth Speaker') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Portable Bluetooth Speaker', 'Waterproof IPX7 Bluetooth speaker with 360-degree rich stereo sound. 20-hour battery life and a compact design that fits in your palm.', id, 'PowerLab', 'active', 'unisex', 'electronics', 'speaker', 4.5, 44
    FROM categories WHERE slug = 'electronics-speakers';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mechanical Gaming Keyboard') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Mechanical Gaming Keyboard', 'Full-size mechanical keyboard with hot-swappable blue switches and per-key RGB backlighting. Aircraft-grade aluminum frame with a detachable USB-C cable.', id, 'TechPro', 'active', 'unisex', 'electronics', 'keyboard', 4.6, 36
    FROM categories WHERE slug = 'electronics-keyboards';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'ProTab S9 Ultra') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'ProTab S9 Ultra', 'Premium 11-inch tablet with a 120Hz AMOLED display, included stylus, and long-lasting battery. Perfect for creative work and entertainment.', id, 'TechPro', 'active', 'unisex', 'electronics', 'tablet', 4.8, 29
    FROM categories WHERE slug = 'electronics-tablets';
  END IF;
END $$;

-- Ultrabook Pro 14" variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '512GB', 'Space Grey', 55000, 15, 'LAPTOP-001', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Ultrabook Pro 14"'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '1TB', 'Space Grey', 65000, 10, 'LAPTOP-002', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Ultrabook Pro 14"'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '512GB', 'Silver', 55000, 12, 'LAPTOP-003', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Ultrabook Pro 14"'
ON CONFLICT (sku) DO NOTHING;

-- Fitness Smart Watch variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Black', 10000, 40, 'SWATCH-001', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Fitness Smart Watch'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'White', 10000, 35, 'SWATCH-002', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Fitness Smart Watch'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Rose Gold', 12000, 25, 'SWATCH-003', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Fitness Smart Watch'
ON CONFLICT (sku) DO NOTHING;

-- Portable Bluetooth Speaker variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Black', 2800, 50, 'SPEAK-001', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Portable Bluetooth Speaker'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Blue', 3200, 35, 'SPEAK-002', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Portable Bluetooth Speaker'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Red', 3500, 28, 'SPEAK-003', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Portable Bluetooth Speaker'
ON CONFLICT (sku) DO NOTHING;

-- Mechanical Gaming Keyboard variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Full', 'Black', 3500, 35, 'KEYB-001', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Mechanical Gaming Keyboard'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Full', 'White', 4000, 25, 'KEYB-002', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Mechanical Gaming Keyboard'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'TKL', 'Black', 4500, 20, 'KEYB-003', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Mechanical Gaming Keyboard'
ON CONFLICT (sku) DO NOTHING;

-- ProTab S9 Ultra variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '256GB', 'Graphite', 35000, 18, 'TAB-001', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'ProTab S9 Ultra'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '512GB', 'Graphite', 45000, 12, 'TAB-002', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'ProTab S9 Ultra'
ON CONFLICT (sku) DO NOTHING;

