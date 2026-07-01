-- ===========================================
-- ADD PRODUCT RECOMMENDATION LOGIC
-- ===========================================

-- Add function to get frequently bought together products
-- This SQL function can be used to query related products

-- Add this to supabase/migrations/002_product_catalog.sql or create a new migration

-- Sample function to get recommendations based on order_items data
CREATE OR REPLACE FUNCTION get_recommendations(purchased_product_id UUID)
RETURNS TABLE(product_id UUID, product_name TEXT, popularity INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.product_id,
    p.name as product_name,
    COUNT(*) as popularity
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  WHERE oi.product_id != purchased_product_id
  GROUP BY oi.product_id, p.name
  ORDER BY popularity DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Sample query to get top related products for a given product
-- Can be used in admin dashboard or on product pages
SELECT * FROM get_recommendations('product-uuid-here');