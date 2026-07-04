ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'english'
CHECK (language IN ('english', 'bangla', 'banglish'));

CREATE OR REPLACE FUNCTION public.sync_product_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
BEGIN
  target_product_id := COALESCE(NEW.product_id, OLD.product_id);

  UPDATE public.products
  SET
    average_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE product_id = target_product_id
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = target_product_id
    ),
    updated_at = NOW()
  WHERE id = target_product_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS reviews_sync_product_stats ON public.reviews;

CREATE TRIGGER reviews_sync_product_stats
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_review_stats();

UPDATE public.products
SET
  average_rating = COALESCE((
    SELECT ROUND(AVG(r.rating)::numeric, 2)
    FROM public.reviews r
    WHERE r.product_id = products.id
  ), 0),
  review_count = (
    SELECT COUNT(*)
    FROM public.reviews r
    WHERE r.product_id = products.id
  ),
  updated_at = NOW();
