-- ===========================================
-- 014: Fix search_logs INSERT policy
-- The live database rejects anonymous inserts into search_logs
-- (42501 RLS violation) even though 001/013 define an open insert
-- policy — the live policy drifted from the repo. Recreate it
-- explicitly for both anon and authenticated roles.
-- ===========================================

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert search logs" ON search_logs;
CREATE POLICY "Anyone can insert search logs" ON search_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Table-level grants (RLS is evaluated after grants)
GRANT INSERT ON search_logs TO anon, authenticated;

-- Same belt-and-braces for the other tracking tables
GRANT INSERT ON click_events TO anon, authenticated;
GRANT INSERT, UPDATE ON user_sessions TO anon, authenticated;
GRANT INSERT, UPDATE, SELECT ON recommendation_logs TO anon, authenticated;
GRANT SELECT ON click_events TO anon, authenticated;
GRANT SELECT ON user_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_ratings_explicit TO anon, authenticated;
