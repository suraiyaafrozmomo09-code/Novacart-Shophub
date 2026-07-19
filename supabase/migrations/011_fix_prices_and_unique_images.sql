-- ===========================================
-- NovaCart: Realistic Prices & Unique Images Migration
-- ===========================================
-- All prices capped at 90,000 TK max
-- Each product variant gets a unique image URL
-- ===========================================

-- ===========================================
-- 1. PRICE FIXES - Make prices more realistic
-- ===========================================

-- Cap prices at 90,000 TK (safety net)
UPDATE public.product_variants
SET price = 90000
WHERE price > 90000;

-- Reduce high-end laptop prices
UPDATE public.product_variants SET price = 55000 WHERE sku = 'LAPTOP-001';
UPDATE public.product_variants SET price = 65000 WHERE sku = 'LAPTOP-002';
UPDATE public.product_variants SET price = 55000 WHERE sku = 'LAPTOP-003';

-- Reduce smartphone price
UPDATE public.product_variants SET price = 65000 WHERE sku = 'IPHONE-001';

-- Reduce smartwatch prices
UPDATE public.product_variants SET price = 10000 WHERE sku IN ('SWATCH-001', 'SWATCH-002');
UPDATE public.product_variants SET price = 12000 WHERE sku = 'SWATCH-003';

-- Reduce tablet prices
UPDATE public.product_variants SET price = 35000 WHERE sku = 'TAB-001';
UPDATE public.product_variants SET price = 45000 WHERE sku = 'TAB-002';

-- Reduce gaming keyboard prices
UPDATE public.product_variants SET price = 3500 WHERE sku = 'KEYB-001';
UPDATE public.product_variants SET price = 4000 WHERE sku = 'KEYB-002';
UPDATE public.product_variants SET price = 4500 WHERE sku = 'KEYB-003';

-- ===========================================
-- 2. UNIQUE IMAGES FOR ALL PRODUCT VARIANTS
-- ===========================================

-- Men's Clothing - Shirts
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men%27s+dress+shirt&v=MSHIRT-001' WHERE sku = 'MSHIRT-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men%27s+dress+shirt&v=MSHIRT-002' WHERE sku = 'MSHIRT-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men%27s+dress+shirt&v=MSHIRT-003' WHERE sku = 'MSHIRT-003';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?flannel+shirt&v=MSHIRT-004' WHERE sku = 'MSHIRT-004';

-- Men's T-Shirts
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+white+tshirt&v=MTEE-001' WHERE sku = 'MTEE-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+white+tshirt&v=MTEE-002' WHERE sku = 'MTEE-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+black+tshirt&v=MTEE-003' WHERE sku = 'MTEE-003';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?graphic+tshirt&v=MTEE-004' WHERE sku = 'MTEE-004';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?graphic+tshirt&v=MTEE-005' WHERE sku = 'MTEE-005';

-- Men's Panjabi
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+panjabi&v=MPANJ-001' WHERE sku = 'MPANJ-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+panjabi&v=MPANJ-002' WHERE sku = 'MPANJ-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+panjabi&v=MPANJ-003' WHERE sku = 'MPANJ-003';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?festival+panjabi&v=MPANJ-004' WHERE sku = 'MPANJ-004';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?festival+panjabi&v=MPANJ-005' WHERE sku = 'MPANJ-005';

-- Men's Pants
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+chinos&v=MPANTS-001' WHERE sku = 'MPANTS-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+chinos&v=MPANTS-002' WHERE sku = 'MPANTS-002';

-- Men's Shorts
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+shorts&v=MSHORT-001' WHERE sku = 'MSHORT-001';

-- Men's Jackets
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?leather+jacket&v=MJACK-001' WHERE sku IN ('MJACK-001', 'MJACK-002', 'MJACK-003');
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?bomber+jacket&v=MJACK-004' WHERE sku IN ('MJACK-004', 'MJACK-005', 'MJACK-006');

-- Men's Hoodies
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+hoodie&v=MHOOD-001' WHERE sku = 'MHOOD-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+hoodie&v=MHOOD-002' WHERE sku = 'MHOOD-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+hoodie&v=MHOOD-003' WHERE sku = 'MHOOD-003';

-- Men's Sweaters
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+sweater&v=MSWTR-001' WHERE sku = 'MSWTR-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+sweater&v=MSWTR-002' WHERE sku = 'MSWTR-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+sweater&v=MSWTR-003' WHERE sku = 'MSWTR-003';

-- Men's Blazers
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+blazer&v=MBLAZ-001' WHERE sku IN ('MBLAZ-001', 'MBLAZ-002');
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+blazer&v=MBLAZ-003' WHERE sku = 'MBLAZ-003';

-- Men's Sandals
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+sandals&v=WSAND-001' WHERE sku = 'WSAND-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?women+sandals&v=WSAND-002' WHERE sku = 'WSAND-002';

-- Men's Sneakers
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+sneakers&v=MESNE-001' WHERE sku = 'MESNE-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+sneakers&v=MESNE-002' WHERE sku = 'MESNE-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+sneakers&v=MESNE-003' WHERE sku = 'MESNE-003';

-- Men's Formal Shoes (Oxford)
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+oxford+shoes&v=FOXFD-001' WHERE sku = 'FOXFD-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+oxford+shoes&v=FOXFD-002' WHERE sku = 'FOXFD-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?brown+oxford+shoes&v=FOXFD-003' WHERE sku = 'FOXFD-003';

-- Men's Belt
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+leather+belt&v=BELT-001' WHERE sku = 'BELT-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+leather+belt&v=BELT-002' WHERE sku = 'BELT-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?brown+leather+belt&v=BELT-003' WHERE sku = 'BELT-003';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?brown+leather+belt&v=BELT-004' WHERE sku = 'BELT-004';

-- Men's Wallet
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+wallet&v=WALLET-001' WHERE sku = 'WALLET-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?brown+wallet&v=WALLET-002' WHERE sku = 'WALLET-002';

-- Men's Perfume
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+perfume&v=MPERF-001' WHERE sku = 'MPERF-001';

-- Men's Watch
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?men+analog+watch&v=MWATCH-001' WHERE sku = 'MWATCH-001';

-- Women's Clothing - Kurti
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?embroidered+kurti&v=WKURTI-001' WHERE sku = 'WKURTI-001';

-- Women's Tops
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?printed+top&v=WTOP-001' WHERE sku = 'WTOP-001';

-- Women's Two Piece
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?two+piece+kurti&v=W2PCE-001' WHERE sku = 'W2PCE-001';

-- Women's Three Piece
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?three+piece+salwar+kameez&v=W3PC-001' WHERE sku = 'W3PC-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?three+piece+salwar+kameez&v=W3PC-002' WHERE sku = 'W3PC-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?three+piece+salwar+kameez&v=W3PC-003' WHERE sku = 'W3PC-003';

-- Women's Jeans
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+skinny+jeans&v=WJEAN-001' WHERE sku = 'WJEAN-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?blue+skinny+jeans&v=WJEAN-002' WHERE sku = 'WJEAN-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?blue+skinny+jeans&v=WJEAN-003' WHERE sku = 'WJEAN-003';

-- Women's Dresses
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?floral+summer+dress&v=WDRES-001' WHERE sku = 'WDRES-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?floral+summer+dress&v=WDRES-002' WHERE sku = 'WDRES-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?pink+floral+dress&v=WDRES-003' WHERE sku = 'WDRES-003';

-- Evening Party Gown
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+evening+gown&v=WGOWN-001' WHERE sku = 'WGOWN-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+evening+gown&v=WGOWN-002' WHERE sku = 'WGOWN-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?red+evening+gown&v=WGOWN-003' WHERE sku = 'WGOWN-003';

-- Women's Leggings
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+yoga+leggings&v=WLEGG-001' WHERE sku = 'WLEGG-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+yoga+leggings&v=WLEGG-002' WHERE sku = 'WLEGG-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?navy+yoga+leggings&v=WLEGG-003' WHERE sku = 'WLEGG-003';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?maroon+yoga+leggings&v=WLEGG-004' WHERE sku = 'WLEGG-004';

-- Women's Skirt
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+pleated+skirt&v=WSKRT-001' WHERE sku = 'WSKRT-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+pleated+skirt&v=WSKRT-002' WHERE sku = 'WSKRT-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?khaki+pleated+skirt&v=WSKRT-003' WHERE sku = 'WSKRT-003';

-- Women's Heels
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+stiletto+heels&v=WHEEL-001' WHERE sku = 'WHEEL-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?beige+summer+heels&v=WHEEL-002' WHERE sku = 'WHEEL-002';

-- Women's Watch
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?women+crystal+watch&v=WWATCH-001' WHERE sku = 'WWATCH-001';

-- Women's Perfume
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?rose+perfume&v=WPERF-001' WHERE sku = 'WPERF-001';

-- Accessories - Sunglasses
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?aviator+sunglasses&v=SGLASS-001' WHERE sku = 'SGLASS-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+aviator+sunglasses&v=SGLASS-002' WHERE sku = 'SGLASS-002';

-- Accessories - Wallet
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?rfid+wallet&v=WALLET-001' WHERE sku = 'WALLET-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?rfid+wallet&v=WALLET-002' WHERE sku = 'WALLET-002';

-- Accessories - Tote Bag
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?canvas+tote+bag&v=BAG-001' WHERE sku = 'BAG-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+canvas+tote&v=BAG-002' WHERE sku = 'BAG-002';

-- Accessories - Crossbody Bag
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?leather+crossbody+bag&v=BAG-003' WHERE sku = 'BAG-003';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?leather+crossbody+bag&v=BAG-004' WHERE sku = 'BAG-004';

-- Electronics - Phone
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?iphone+15+pro+max&v=IPHONE-001' WHERE sku = 'IPHONE-001';

-- Electronics - Headphones
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+wireless+headphones&v=HEAD-001' WHERE sku = 'HEAD-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+red+gaming+headset&v=HEAD-002' WHERE sku = 'HEAD-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+gaming+headset&v=HEAD-003' WHERE sku = 'HEAD-003';

-- Electronics - Earbuds
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?pocket+bluetooth+earbuds&v=EAR-001' WHERE sku = 'EAR-001';

-- Electronics - Charger
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?33w+usb+charger&v=CHAR-001' WHERE sku = 'CHAR-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+usb+charger&v=CHAR-002' WHERE sku = 'CHAR-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+usb+charger&v=CHAR-003' WHERE sku = 'CHAR-003';

-- Electronics - Power Bank
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?slim+power+bank&v=PBANK-001' WHERE sku = 'PBANK-001';

-- Electronics - Mouse
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?wireless+mouse&v=MOUSE-001' WHERE sku = 'MOUSE-001';

-- Electronics - Laptop
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?space+grey+ultrabook&v=LAPTOP-001' WHERE sku = 'LAPTOP-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?1tb+space+grey+laptop&v=LAPTOP-002' WHERE sku = 'LAPTOP-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?silver+ultrabook&v=LAPTOP-003' WHERE sku = 'LAPTOP-003';

-- Electronics - Smartwatch
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+fitness+smartwatch&v=SWATCH-001' WHERE sku = 'SWATCH-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+fitness+smartwatch&v=SWATCH-002' WHERE sku = 'SWATCH-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?rose+gold+smartwatch&v=SWATCH-003' WHERE sku = 'SWATCH-003';

-- Electronics - Speaker
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+bluetooth+speaker&v=SPEAK-001' WHERE sku = 'SPEAK-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?blue+bluetooth+speaker&v=SPEAK-002' WHERE sku = 'SPEAK-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?red+bluetooth+speaker&v=SPEAK-003' WHERE sku = 'SPEAK-003';

-- Electronics - Keyboard
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+mechanical+keyboard&v=KEYB-001' WHERE sku = 'KEYB-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+mechanical+keyboard&v=KEYB-002' WHERE sku = 'KEYB-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?tkl+mechanical+keyboard&v=KEYB-003' WHERE sku = 'KEYB-003';

-- Electronics - Tablet
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?graphite+tablet&v=TAB-001' WHERE sku = 'TAB-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?graphite+tablet&v=TAB-002' WHERE sku = 'TAB-002';

-- Electronics - Webcam
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?4k+webcam&v=WEBCAM-001' WHERE sku = 'WEBCAM-001';

-- Electronics - USB Hub
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?space+grey+usb+hub&v=HUB-001' WHERE sku = 'HUB-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?silver+usb+hub&v=HUB-002' WHERE sku = 'HUB-002';

-- Electronics - Gaming Headset
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?gaming+headset&v=HEAD-002' WHERE sku = 'HEAD-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?gaming+headset&v=HEAD-003' WHERE sku = 'HEAD-003';

-- Baby Clothes - Onesie
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?pink+baby+onesie&v=BABY-ONESIE-001' WHERE sku = 'BABY-ONESIE-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?blue+baby+onesie&v=BABY-ONESIE-002' WHERE sku = 'BABY-ONESIE-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+baby+onesie&v=BABY-ONESIE-003' WHERE sku = 'BABY-ONESIE-003';

-- Baby Clothes - Romper
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?yellow+baby+romper&v=BABY-ROMPER-001' WHERE sku = 'BABY-ROMPER-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+baby+romper&v=BABY-ROMPER-002' WHERE sku = 'BABY-ROMPER-002';

-- Baby Clothes - Jacket
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?navy+baby+winter+jacket&v=BABY-JACKET-001' WHERE sku = 'BABY-JACKET-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?grey+baby+winter+jacket&v=BABY-JACKET-002' WHERE sku = 'BABY-JACKET-002';

-- Men's Cargo Joggers
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+cargo+joggers&v=MJOGG-001' WHERE sku = 'MJOGG-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?olive+cargo+joggers&v=MJOGG-002' WHERE sku = 'MJOGG-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?grey+cargo+joggers&v=MJOGG-003' WHERE sku = 'MJOGG-003';

-- Men's Slim Fit Suit
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?charcoal+slim+fit+suit&v=MSUIT-001' WHERE sku = 'MSUIT-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?navy+slim+fit+suit&v=MSUIT-002' WHERE sku = 'MSUIT-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+slim+fit+suit&v=MSUIT-003' WHERE sku = 'MSUIT-003';

-- Women's Silk Blouse
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?cream+silk+blouse&v=WBLOU-001' WHERE sku = 'WBLOU-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?cream+silk+blouse&v=WBLOU-002' WHERE sku = 'WBLOU-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?blush+pink+silk+blouse&v=WBLOU-003' WHERE sku = 'WBLOU-003';

-- Women's Midi Dress
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?sage+green+midi+dress&v=WMIDI-001' WHERE sku = 'WMIDI-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?sage+green+midi+dress&v=WMIDI-002' WHERE sku = 'WMIDI-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?navy+midi+dress&v=WMIDI-003' WHERE sku = 'WMIDI-003';

-- Gold Plated Necklace
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?gold+plated+necklace&v=NECKL-001' WHERE sku = 'NECKL-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?silver+gold+necklace&v=NECKL-002' WHERE sku = 'NECKL-002';

-- Sterling Silver Ring
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?silver+ring+size+6&v=RING-001' WHERE sku = 'RING-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?silver+ring+size+7&v=RING-002' WHERE sku = 'RING-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?gold+ring+size+8&v=RING-003' WHERE sku = 'RING-003';

-- Leather Bracelet
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?brown+leather+bracelet&v=BRACE-001' WHERE sku = 'BRACE-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+leather+bracelet&v=BRACE-002' WHERE sku = 'BRACE-002';

-- 4K Webcam
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?4k+webcam&v=WEBCAM-001' WHERE sku = 'WEBCAM-001';

-- USB-C Hub
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?7-in-1+usb-c+hub&v=HUB-001' WHERE sku = 'HUB-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?7-in-1+usb-c+hub&v=HUB-002' WHERE sku = 'HUB-002';

-- Wireless Charger Pad
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+wireless+charger&v=CHRG-002' WHERE sku = 'CHRG-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?black+wireless+charger&v=CHRG-003' WHERE sku = 'CHRG-003';

-- Women's Running Shoes
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+womens+running+shoes&v=WRUN-001' WHERE sku = 'WRUN-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?pink+womens+running+shoes&v=WRUN-002' WHERE sku = 'WRUN-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+womens+running+shoes&v=WRUN-003' WHERE sku = 'WRUN-003';

-- Baby Cotton Leggings
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?white+baby+leggings&v=BABY-LEGG-001' WHERE sku = 'BABY-LEGG-001';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?grey+baby+leggings&v=BABY-LEGG-002' WHERE sku = 'BABY-LEGG-002';
UPDATE public.product_variants pv SET image = 'https://source.unsplash.com/400x400/?navy+baby+leggings&v=BABY-LEGG-003' WHERE sku = 'BABY-LEGG-003';

-- ===========================================
-- 3. ADD UNIQUE IMAGES TO REMAINING NULL IMAGES
-- ===========================================

-- Generate unique images for any variant still having NULL image
UPDATE public.product_variants
SET image = 'https://source.unsplash.com/400x400/?product&v=' || COALESCE(sku, 'unknown')
WHERE image IS NULL;