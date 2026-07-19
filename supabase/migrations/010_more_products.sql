-- ===========================================
-- NovaCart Catalog Expansion 010
-- More products across all categories (TK prices)
-- ===========================================

-- ===========================================
-- 1. NEW SUB-CATEGORIES
-- ===========================================

INSERT INTO categories (name, slug, description, parent_id)
VALUES
  ('Jewelry', 'jewelry', 'Necklaces, rings, bracelets and more', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Women''s Jeans', 'womens-jeans', 'Stylish jeans for women', (SELECT id FROM categories WHERE slug = 'womens-clothing'))
ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- 2. MEN'S CLOTHING - NEW PRODUCTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Premium Polo Shirt') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Premium Polo Shirt', 'Classic pique cotton polo with a ribbed collar and two-button placket. Breathable fabric with a tailored fit for smart-casual occasions.', id, 'GentlemansWear', 'active', 'male', 'clothing', 't-shirt', 4.6, 31
    FROM categories WHERE slug = 'mens-tshirts';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Men''s Cargo Joggers') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Men''s Cargo Joggers', 'Comfortable joggers with zip pockets and an elastic cuffed hem. Cotton-polyester blend with a modern tapered fit for daily wear.', id, 'UrbanStyle', 'active', 'male', 'clothing', 'pants', 4.4, 23
    FROM categories WHERE slug = 'mens-pants';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Men''s Slim Fit Suit') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Men''s Slim Fit Suit', 'Two-piece slim fit suit in premium wool-blend fabric. Features a two-button jacket with notch lapels and flat-front trousers with a tailored silhouette.', id, 'GentlemansWear', 'active', 'male', 'clothing', 'blazer', 4.8, 18
    FROM categories WHERE slug = 'mens-blazers';
  END IF;
END $$;

-- Premium Polo Shirt variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Navy', 1200, 40, 'MPOLO-001', 'https://images.unsplash.com/photo-1598033129183-c4f50c736e10?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Polo Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Navy', 1200, 38, 'MPOLO-002', 'https://images.unsplash.com/photo-1598033129183-c4f50c736e10?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Polo Shirt'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'White', 1500, 30, 'MPOLO-003', 'https://images.unsplash.com/photo-1598033129183-c4f50c736e10?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Premium Polo Shirt'
ON CONFLICT (sku) DO NOTHING;

-- Cargo Joggers variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Black', 1500, 45, 'MJOGG-001', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Cargo Joggers'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Olive', 1500, 40, 'MJOGG-002', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Cargo Joggers'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Grey', 1800, 35, 'MJOGG-003', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Cargo Joggers'
ON CONFLICT (sku) DO NOTHING;

-- Slim Fit Suit variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Charcoal', 15000, 12, 'MSUIT-001', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Slim Fit Suit'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Navy', 15000, 10, 'MSUIT-002', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Slim Fit Suit'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'XL', 'Black', 18000, 8, 'MSUIT-003', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Slim Fit Suit'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- 3. WOMEN'S CLOTHING - NEW PRODUCTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Women''s Silk Blouse') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Women''s Silk Blouse', 'Luxurious silk charmeuse blouse with a hidden button front and delicate French seams. A versatile piece that transitions effortlessly from desk to dinner.', id, 'UrbanChic', 'active', 'female', 'clothing', 'tops', 4.7, 29
    FROM categories WHERE slug = 'womens-tops';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Women''s Midi Dress') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Women''s Midi Dress', 'Elegant midi dress with a flattering wrap silhouette and soft viscose fabrication. Features a V-neckline, tie waist, and gentle short sleeves.', id, 'RoyaleFemme', 'active', 'female', 'clothing', 'dress', 4.6, 35
    FROM categories WHERE slug = 'womens-dresses';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Women''s Skinny Jeans') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Women''s Skinny Jeans', 'High-stretch skinny jeans with a flattering mid-rise waist. Comfortable cotton-elastane blend with a sleek silhouette that pairs with anything.', id, 'UrbanChic', 'active', 'female', 'clothing', 'jeans', 4.5, 27
    FROM categories WHERE slug = 'womens-jeans';
  END IF;
END $$;

-- Silk Blouse variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Cream', 1200, 30, 'WBLOU-001', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Silk Blouse'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Cream', 1200, 35, 'WBLOU-002', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Silk Blouse'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Blush Pink', 1500, 25, 'WBLOU-003', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Silk Blouse'
ON CONFLICT (sku) DO NOTHING;

-- Midi Dress variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'S', 'Sage Green', 3000, 20, 'WMIDI-001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Midi Dress'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'M', 'Sage Green', 3000, 22, 'WMIDI-002', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Midi Dress'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'L', 'Navy', 3500, 18, 'WMIDI-003', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Midi Dress'
ON CONFLICT (sku) DO NOTHING;

-- Skinny Jeans variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '26', 'Black', 2200, 30, 'WJEAN-001', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Skinny Jeans'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '28', 'Blue', 2200, 35, 'WJEAN-002', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Skinny Jeans'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '30', 'Blue', 2500, 28, 'WJEAN-003', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Skinny Jeans'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- 4. JEWELRY PRODUCTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Gold Plated Necklace') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Gold Plated Necklace', 'Elegant gold-plated chain necklace with a delicate lobster clasp. Features a subtle pendant design that complements both casual and formal attire.', id, 'VogueLook', 'active', 'female', 'accessories', 'jewelry', 4.7, 24
    FROM categories WHERE slug = 'jewelry';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sterling Silver Ring') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Sterling Silver Ring', 'Classic sterling silver ring with a polished high-shine finish. Comfort-fit shank and a timeless band design suitable for everyday elegance.', id, 'VogueLook', 'active', 'female', 'accessories', 'jewelry', 4.8, 19
    FROM categories WHERE slug = 'jewelry';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Leather Bracelet') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Leather Bracelet', 'Handcrafted genuine leather bracelet with a magnetic clasp. Minimalist design with a braided texture that adds understated character to any look.', id, 'GentlemansWear', 'active', 'unisex', 'accessories', 'jewelry', 4.4, 16
    FROM categories WHERE slug = 'jewelry';
  END IF;
END $$;

-- Necklace variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Gold', 2500, 25, 'NECKL-001', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Gold Plated Necklace'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Silver', 2800, 20, 'NECKL-002', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Gold Plated Necklace'
ON CONFLICT (sku) DO NOTHING;

-- Ring variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Size 6', 'Silver', 1500, 20, 'RING-001', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Sterling Silver Ring'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Size 7', 'Silver', 1500, 22, 'RING-002', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Sterling Silver Ring'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Size 8', 'Gold', 2000, 15, 'RING-003', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Sterling Silver Ring'
ON CONFLICT (sku) DO NOTHING;

-- Bracelet variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Brown', 900, 30, 'BRACE-001', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Leather Bracelet'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'One Size', 'Black', 900, 28, 'BRACE-002', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Leather Bracelet'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- 5. ELECTRONICS - NEW PRODUCTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = '4K Webcam') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT '4K Webcam', 'Ultra HD 4K webcam with auto-focus and built-in noise-cancelling dual microphones. Plug-and-play USB connectivity with a universal clip for any monitor.', id, 'TechPro', 'active', 'unisex', 'electronics', 'other', 4.5, 33
    FROM categories WHERE slug = 'electronics-other';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Gaming Headset') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Gaming Headset', 'Immersive gaming headset with 7.1 surround sound and a noise-isolating closed-back design. Memory foam ear cushions and a flexible noise-cancelling microphone.', id, 'TechPro', 'active', 'unisex', 'electronics', 'headphones', 4.6, 41
    FROM categories WHERE slug = 'electronics-headphones';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'USB-C Hub 7-in-1') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'USB-C Hub 7-in-1', 'Compact 7-port USB-C hub with HDMI 4K output, 100W Power Delivery pass-through, USB 3.0 ports, SD card reader, and a 3.5mm audio jack. Slim aluminium body.', id, 'PowerLab', 'active', 'unisex', 'electronics', 'other', 4.4, 28
    FROM categories WHERE slug = 'electronics-other';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wireless Charger Pad') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Wireless Charger Pad', 'Fast wireless charging pad with 15W max output. Compatible with all Qi-enabled devices. Features LED charging indicator and anti-slip silicone ring.', id, 'PowerLab', 'active', 'unisex', 'electronics', 'charger', 4.5, 38
    FROM categories WHERE slug = 'electronics-chargers';
  END IF;
END $$;

-- 4K Webcam variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Black', 4000, 25, 'WEBCAM-001', 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop'
FROM products p WHERE p.name = '4K Webcam'
ON CONFLICT (sku) DO NOTHING;

-- Gaming Headset variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Black/Red', 3500, 30, 'HEAD-002', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Gaming Headset'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'White', 4000, 22, 'HEAD-003', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Gaming Headset'
ON CONFLICT (sku) DO NOTHING;

-- USB-C Hub variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Space Grey', 2500, 28, 'HUB-001', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'USB-C Hub 7-in-1'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Silver', 2500, 24, 'HUB-002', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'USB-C Hub 7-in-1'
ON CONFLICT (sku) DO NOTHING;

-- Wireless Charger Pad variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'Black', 1000, 45, 'CHRG-002', 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Wireless Charger Pad'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, 'Standard', 'White', 1000, 40, 'CHRG-003', 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Wireless Charger Pad'
ON CONFLICT (sku) DO NOTHING;

-- ===========================================
-- 6. FOOTWEAR - NEW PRODUCTS
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Men''s Formal Oxford Shoes') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Men''s Formal Oxford Shoes', 'Classic cap-toe oxford shoes in polished calf leather. Blake-stitched construction with a leather sole and subtle brogue detailing for timeless sophistication.', id, 'GentlemansWear', 'active', 'male', 'footwear', 'oxford', 4.7, 22
    FROM categories WHERE slug = 'mens-other-shoes';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Women''s Running Shoes') THEN
    INSERT INTO products (name, description, category_id, brand, status, gender, product_type, sub_type, average_rating, review_count)
    SELECT 'Women''s Running Shoes', 'Lightweight running shoes with responsive cushioning and a breathable knit upper. Engineered mesh provides ventilation while the rubber outsole delivers reliable traction.', id, 'UrbanChic', 'active', 'female', 'footwear', 'running', 4.5, 30
    FROM categories WHERE slug = 'womens-other-shoes';
  END IF;
END $$;

-- Oxford Shoes variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '42', 'Black', 4500, 18, 'FOXFD-001', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Formal Oxford Shoes'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '43', 'Black', 4500, 20, 'FOXFD-002', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Formal Oxford Shoes'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '44', 'Brown', 5000, 15, 'FOXFD-003', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Men''s Formal Oxford Shoes'
ON CONFLICT (sku) DO NOTHING;

-- Women's Running Shoes variants
INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '37', 'White', 4000, 25, 'WRUN-001', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Running Shoes'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '38', 'Pink', 4000, 22, 'WRUN-002', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Running Shoes'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, size, color, price, quantity, sku, image)
SELECT p.id, '39', 'White', 4500, 20, 'WRUN-003', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
FROM products p WHERE p.name = 'Women''s Running Shoes'
ON CONFLICT (sku) DO NOTHING;
