-- Run this in Supabase SQL Editor

-- Fix prices
UPDATE public.product_variants SET price = 90000 WHERE price > 90000;
UPDATE public.product_variants SET price = 55000 WHERE sku = 'LAPTOP-001';
UPDATE public.product_variants SET price = 65000 WHERE sku = 'LAPTOP-002';
UPDATE public.product_variants SET price = 55000 WHERE sku = 'LAPTOP-003';
UPDATE public.product_variants SET price = 65000 WHERE sku = 'IPHONE-001';
UPDATE public.product_variants SET price = 10000 WHERE sku IN ('SWATCH-001', 'SWATCH-002');
UPDATE public.product_variants SET price = 12000 WHERE sku = 'SWATCH-003';
UPDATE public.product_variants SET price = 35000 WHERE sku = 'TAB-001';
UPDATE public.product_variants SET price = 45000 WHERE sku = 'TAB-002';
UPDATE public.product_variants SET price = 3500 WHERE sku = 'KEYB-001';
UPDATE public.product_variants SET price = 4000 WHERE sku = 'KEYB-002';
UPDATE public.product_variants SET price = 4500 WHERE sku = 'KEYB-003';

-- Assign unique images to NULL image variants
UPDATE public.product_variants SET image = 'https://source.unsplash.com/400x400/?product&v=' || COALESCE(sku, 'unknown') WHERE image IS NULL;