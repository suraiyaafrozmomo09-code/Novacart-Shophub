-- ===========================================
-- Fix all product images with working Unsplash URLs
-- ===========================================

-- Men's Clothing - Shirts
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1603257395605-2cc1ada02745?w=400&h=400&fit=crop' WHERE sku IN ('MSHIRT-001', 'MSHIRT-002', 'MSHIRT-003');
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1594954767700-628f0f040a6c?w=400&h=400&fit=crop' WHERE sku = 'MSHIRT-004';

-- Men's T-Shirts
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' WHERE sku IN ('MTEE-001', 'MTEE-002', 'MTEE-003');
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' WHERE sku IN ('MTEE-004', 'MTEE-005');

-- Men's Panjabi
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1620012253295-c15cc3e65d4c?w=400&h=400&fit=crop' WHERE sku IN ('MPANJ-001', 'MPANJ-002', 'MPANJ-003');
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1617123151875-0adda5efbf3b?w=400&h=400&fit=crop' WHERE sku IN ('MPANJ-004', 'MPANJ-005');

-- Men's Pants
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop' WHERE sku IN ('MPANTS-001', 'MPANTS-002');

-- Men's Shorts
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop' WHERE sku = 'MSHORT-001';

-- Men's Jackets
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop' WHERE sku IN ('MJACK-001', 'MJACK-002', 'MJACK-003');
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop' WHERE sku IN ('MJACK-004', 'MJACK-005', 'MJACK-006');

-- Men's Hoodies
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop' WHERE sku IN ('MHOOD-001', 'MHOOD-002', 'MHOOD-003');

-- Men's Sweaters
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a10?w=400&h=400&fit=crop' WHERE sku IN ('MSWTR-001', 'MSWTR-002', 'MSWTR-003');

-- Men's Blazers
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' WHERE sku IN ('MBLAZ-001', 'MBLAZ-002', 'MBLAZ-003');

-- Men's Sandals
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=400&fit=crop' WHERE sku IN ('WSAND-001', 'WSAND-002');

-- Men's Sneakers
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1519681393784-d120d40df6d2?w=400&h=400&fit=crop' WHERE sku IN ('MESNE-001', 'MESNE-002', 'MESNE-003');

-- Men's Formal Shoes (Oxford)
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop' WHERE sku IN ('FOXFD-001', 'FOXFD-002', 'FOXFD-003');

-- Men's Belt
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' WHERE sku IN ('BELT-001', 'BELT-002', 'BELT-003', 'BELT-004');

-- Men's Wallet
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop' WHERE sku IN ('WALLET-001', 'WALLET-002');

-- Men's Perfume
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop' WHERE sku = 'MPERF-001';

-- Men's Watch
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop' WHERE sku = 'MWATCH-001';

-- Women's Clothing - Kurti
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop' WHERE sku = 'WKURTI-001';

-- Women's Tops
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=400&fit=crop' WHERE sku = 'WTOP-001';

-- Women's Two Piece
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1610030181423-929793d43147?w=400&h=400&fit=crop' WHERE sku = 'W2PCE-001';

-- Women's Three Piece
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1588082340836-8ef8b6a5b5a5?w=400&h=400&fit=crop' WHERE sku IN ('W3PC-001', 'W3PC-002', 'W3PC-003');

-- Women's Jeans
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop' WHERE sku IN ('WJEAN-001', 'WJEAN-002', 'WJEAN-003');

-- Women's Dresses
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop' WHERE sku IN ('WDRES-001', 'WDRES-002', 'WDRES-003');
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop' WHERE sku IN ('WGOWN-001', 'WGOWN-002', 'WGOWN-003');

-- Women's Leggings
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop' WHERE sku IN ('WLEGG-001', 'WLEGG-002', 'WLEGG-003', 'WLEGG-004');

-- Women's Skirt
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop' WHERE sku IN ('WSKRT-001', 'WSKRT-002', 'WSKRT-003');

-- Women's Heels
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1543168256-418811576931?w=400&h=400&fit=crop' WHERE sku IN ('WHEEL-001', 'WHEEL-002');

-- Women's Watch
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=400&fit=crop' WHERE sku = 'WWATCH-001';

-- Women's Perfume
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop' WHERE sku = 'WPERF-001';

-- Accessories - Sunglasses
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop' WHERE sku IN ('SGLASS-001', 'SGLASS-002');

-- Accessories - Wallet
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop' WHERE sku IN ('WALLET-001', 'WALLET-002');

-- Accessories - Tote Bag
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop' WHERE sku IN ('BAG-001', 'BAG-002');

-- Accessories - Crossbody Bag
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' WHERE sku IN ('BAG-003', 'BAG-004');

-- Electronics - Phone
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop' WHERE sku = 'IPHONE-001';

-- Electronics - Headphones
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' WHERE sku IN ('HEAD-001', 'HEAD-002', 'HEAD-003');

-- Electronics - Earbuds
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop' WHERE sku IN ('EAR-001');

-- Electronics - Charger
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400&h=400&fit=crop' WHERE sku IN ('CHAR-001', 'CHAR-002', 'CHAR-003');

-- Electronics - Power Bank
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1609592424658-2e1d18a49eef?w=400&h=400&fit=crop' WHERE sku = 'PBANK-001';

-- Electronics - Mouse
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1615664610493-559c4c0b1c5c?w=400&h=400&fit=crop' WHERE sku = 'MOUSE-001';

-- Electronics - Laptop
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' WHERE sku IN ('LAPTOP-001', 'LAPTOP-002', 'LAPTOP-003');

-- Electronics - Smartwatch
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop' WHERE sku IN ('SWATCH-001', 'SWATCH-002', 'SWATCH-003');

-- Electronics - Speaker
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' WHERE sku IN ('SPEAK-001', 'SPEAK-002', 'SPEAK-003');

-- Electronics - Keyboard
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop' WHERE sku IN ('KEYB-001', 'KEYB-002', 'KEYB-003');

-- Electronics - Tablet
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop' WHERE sku IN ('TAB-001', 'TAB-002');

-- Electronics - Webcam
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop' WHERE sku = 'WEBCAM-001';

-- Electronics - USB Hub
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop' WHERE sku IN ('HUB-001', 'HUB-002');

-- Baby Clothes - Onesie
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1522775335684-37898b6baf30?w=400&h=400&fit=crop' WHERE sku LIKE 'BABY-ONESIE-%';

-- Baby Clothes - Romper
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1597514660025-1959f53b1f4b?w=400&h=400&fit=crop' WHERE sku LIKE 'BABY-ROMPER-%';

-- Baby Clothes - Jacket
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop' WHERE sku LIKE 'BABY-JACKET-%';

-- Baby Clothes - Leggings (NEW)
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1519238263532-9c9e6e6e6e6e?w=400&h=400&fit=crop' WHERE sku LIKE 'BABY-LEGG-%';

-- Men's Cargo Joggers
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop' WHERE sku IN ('MJOGG-001', 'MJOGG-002', 'MJOGG-003');

-- Men's Slim Fit Suit
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop' WHERE sku IN ('MSUIT-001', 'MSUIT-002', 'MSUIT-003');

-- Women's Silk Blouse
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop' WHERE sku IN ('WBLOU-001', 'WBLOU-002', 'WBLOU-003');

-- Women's Midi Dress
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop' WHERE sku IN ('WMIDI-001', 'WMIDI-002', 'WMIDI-003');

-- Women's Skinny Jeans
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop' WHERE sku IN ('WJEAN-001', 'WJEAN-002', 'WJEAN-003');

-- Gold Plated Necklace
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop' WHERE sku IN ('NECKL-001', 'NECKL-002');

-- Sterling Silver Ring
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop' WHERE sku IN ('RING-001', 'RING-002', 'RING-003');

-- Leather Bracelet
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop' WHERE sku IN ('BRACE-001', 'BRACE-002');

-- Women's Running Shoes
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' WHERE sku IN ('WRUN-001', 'WRUN-002', 'WRUN-003');

-- Men's Formal Oxford Shoes
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&h=400&fit=crop' WHERE sku IN ('FOXFD-001', 'FOXFD-002', 'FOXFD-003');

-- Gaming Headset
UPDATE public.product_variants SET image = 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop' WHERE sku IN ('HEAD-002', 'HEAD-003');

-- ===========================================
-- Fix any remaining NULL images
-- ===========================================
UPDATE public.product_variants
SET image = 'https://images.unsplash.com/photo-1522775335684-37898b6baf30?w=400&h=400&fit=crop'
WHERE image IS NULL;