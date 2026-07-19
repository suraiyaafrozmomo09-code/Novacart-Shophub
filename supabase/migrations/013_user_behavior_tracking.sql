-- ===========================================
-- 013: User Behavior Tracking & Recommendation Support
-- NovaCart Hybrid Recommendation System
-- Idempotent: safe to run on databases where 001 already created
-- click_events / search_logs (adds missing session_id columns).
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. CLICK EVENTS (exists since 001 — extend with session_id)
-- ===========================================
CREATE TABLE IF NOT EXISTS click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id) NOT NULL,
  variant_id UUID REFERENCES product_variants(id),
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE click_events ADD COLUMN IF NOT EXISTS session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_click_events_user_id ON click_events(user_id);
CREATE INDEX IF NOT EXISTS idx_click_events_product_id ON click_events(product_id);
CREATE INDEX IF NOT EXISTS idx_click_events_session_id ON click_events(session_id);
CREATE INDEX IF NOT EXISTS idx_click_events_created_at ON click_events(created_at);

ALTER TABLE click_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert click events" ON click_events;
CREATE POLICY "Anyone can insert click events" ON click_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own click events" ON click_events;
CREATE POLICY "Users can view own click events" ON click_events FOR SELECT USING (auth.uid() = user_id);
-- Behavioral data must be readable by the recommendation engine (anon key).
-- Rows contain no PII beyond opaque UUIDs.
DROP POLICY IF EXISTS "Click events readable for recommendations" ON click_events;
CREATE POLICY "Click events readable for recommendations" ON click_events FOR SELECT USING (true);

-- ===========================================
-- 2. SEARCH LOGS (exists since 001 — extend with session_id)
-- ===========================================
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  query TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE search_logs ADD COLUMN IF NOT EXISTS session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert search logs" ON search_logs;
CREATE POLICY "Anyone can insert search logs" ON search_logs FOR INSERT WITH CHECK (true);

-- ===========================================
-- 3. USER SESSIONS
-- ===========================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_end TIMESTAMPTZ,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create sessions" ON user_sessions;
CREATE POLICY "Anyone can create sessions" ON user_sessions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update sessions" ON user_sessions;
CREATE POLICY "Anyone can update sessions" ON user_sessions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Sessions readable for recommendations" ON user_sessions;
CREATE POLICY "Sessions readable for recommendations" ON user_sessions FOR SELECT USING (true);

-- ===========================================
-- 4. EXPLICIT USER RATINGS (separate from reviews)
-- ===========================================
CREATE TABLE IF NOT EXISTS user_ratings_explicit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating FLOAT NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_ratings_explicit_user ON user_ratings_explicit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_explicit_product ON user_ratings_explicit(product_id);

ALTER TABLE user_ratings_explicit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own explicit ratings" ON user_ratings_explicit;
CREATE POLICY "Users can manage own explicit ratings" ON user_ratings_explicit
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Explicit ratings are readable" ON user_ratings_explicit;
CREATE POLICY "Explicit ratings are readable" ON user_ratings_explicit FOR SELECT USING (true);

-- ===========================================
-- 5. RECOMMENDATION LOGS
-- ===========================================
CREATE TABLE IF NOT EXISTS recommendation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  recommended_product_ids UUID[] NOT NULL,
  algorithm_weights JSONB,
  clicked_items UUID[],
  served_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  clicked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recommendation_logs_user ON recommendation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_served_at ON recommendation_logs(served_at);

ALTER TABLE recommendation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert recommendation logs" ON recommendation_logs;
CREATE POLICY "Anyone can insert recommendation logs" ON recommendation_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update recommendation logs" ON recommendation_logs;
CREATE POLICY "Anyone can update recommendation logs" ON recommendation_logs FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Recommendation logs readable" ON recommendation_logs;
CREATE POLICY "Recommendation logs readable" ON recommendation_logs FOR SELECT USING (true);

-- ===========================================
-- 6. FUNCTION: get_user_item_matrix
-- Combines explicit ratings with implicit signals
-- (purchase = 5.0, add_to_cart = 3.0, search_click = 2.0, view/click = 1.0)
-- ===========================================
CREATE OR REPLACE FUNCTION get_user_item_matrix(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (user_id UUID, product_id UUID, rating FLOAT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH implicit AS (
    -- purchases (strongest signal)
    SELECT o.user_id, oi.product_id, 5.0::FLOAT AS score
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status <> 'cancelled'
    UNION ALL
    -- behavioral events
    SELECT ce.user_id, ce.product_id,
      CASE ce.event_type
        WHEN 'purchase' THEN 5.0
        WHEN 'add_to_cart' THEN 3.0
        WHEN 'search_click' THEN 2.0
        ELSE 1.0
      END::FLOAT AS score
    FROM click_events ce
    WHERE ce.user_id IS NOT NULL
  ),
  implicit_agg AS (
    SELECT i.user_id, i.product_id, LEAST(MAX(i.score), 5.0) AS rating
    FROM implicit i
    GROUP BY i.user_id, i.product_id
  ),
  combined AS (
    -- explicit ratings take priority over implicit signals
    SELECT COALESCE(e.user_id, i.user_id) AS user_id,
           COALESCE(e.product_id, i.product_id) AS product_id,
           COALESCE(e.rating, i.rating)::FLOAT AS rating
    FROM implicit_agg i
    FULL OUTER JOIN user_ratings_explicit e
      ON e.user_id = i.user_id AND e.product_id = i.product_id
  )
  SELECT c.user_id, c.product_id, c.rating
  FROM combined c
  WHERE c.user_id IS NOT NULL
    AND (p_user_id IS NULL OR c.user_id = p_user_id);
$$;

-- ===========================================
-- 7. FUNCTION: get_purchase_association_matrix
-- Product pairs ordered together (FP-Growth support counting)
-- ===========================================
CREATE OR REPLACE FUNCTION get_purchase_association_matrix(min_support INT DEFAULT 2)
RETURNS TABLE (product_a UUID, product_b UUID, pair_count BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.product_id AS product_a,
         b.product_id AS product_b,
         COUNT(DISTINCT a.order_id) AS pair_count
  FROM order_items a
  JOIN order_items b
    ON a.order_id = b.order_id
   AND a.product_id < b.product_id
  JOIN orders o ON o.id = a.order_id AND o.status <> 'cancelled'
  GROUP BY a.product_id, b.product_id
  HAVING COUNT(DISTINCT a.order_id) >= min_support
  ORDER BY pair_count DESC;
$$;

-- ===========================================
-- 8. FUNCTION: get_user_behavior_sequences
-- Ordered per-session sequences of user actions (for PrefixSpan)
-- ===========================================
CREATE OR REPLACE FUNCTION get_user_behavior_sequences(p_user_id UUID DEFAULT NULL, session_limit INT DEFAULT 50)
RETURNS TABLE (session_id TEXT, user_id UUID, product_id UUID, event_type TEXT, event_order BIGINT, created_at TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH recent_sessions AS (
    SELECT ce.session_id, MAX(ce.created_at) AS last_event
    FROM click_events ce
    WHERE ce.session_id IS NOT NULL
      AND (p_user_id IS NULL OR ce.user_id = p_user_id)
    GROUP BY ce.session_id
    ORDER BY last_event DESC
    LIMIT session_limit
  )
  SELECT ce.session_id,
         ce.user_id,
         ce.product_id,
         ce.event_type,
         ROW_NUMBER() OVER (PARTITION BY ce.session_id ORDER BY ce.created_at) AS event_order,
         ce.created_at
  FROM click_events ce
  JOIN recent_sessions rs ON rs.session_id = ce.session_id
  ORDER BY ce.session_id, ce.created_at;
$$;

-- Allow anon/authenticated API roles to call the analytics functions
GRANT EXECUTE ON FUNCTION get_user_item_matrix(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_purchase_association_matrix(INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_behavior_sequences(UUID, INT) TO anon, authenticated;
