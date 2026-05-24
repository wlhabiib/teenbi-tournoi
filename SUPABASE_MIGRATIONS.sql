-- =====================================================
-- SUPABASE MIGRATIONS - COMPLETE SCHEMA
-- =====================================================
-- Run these migrations in order to fix all synchronization issues

-- =====================================================
-- STEP 1: ALTER SETTINGS TABLE - Add missing columns
-- =====================================================
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS sponsor_photo_url TEXT,
ADD COLUMN IF NOT EXISTS background_image_url TEXT,
ADD COLUMN IF NOT EXISTS sponsor_name VARCHAR(255) DEFAULT 'Parrain du Tournoi';

-- =====================================================
-- STEP 2: Remove old RLS policies and create new ones with proper permissions
-- =====================================================

-- Drop old policies (if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.teams;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.matches;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.matches;

-- =====================================================
-- STEP 3: Create new RLS policies for TEAMS
-- =====================================================
CREATE POLICY "teams_select_all" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_insert_all" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "teams_update_all" ON public.teams FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "teams_delete_all" ON public.teams FOR DELETE USING (true);

-- =====================================================
-- STEP 4: Create new RLS policies for MATCHES
-- =====================================================
CREATE POLICY "matches_select_all" ON public.matches FOR SELECT USING (true);
CREATE POLICY "matches_insert_all" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "matches_update_all" ON public.matches FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "matches_delete_all" ON public.matches FOR DELETE USING (true);

-- =====================================================
-- STEP 5: Create new RLS policies for MESSAGES
-- =====================================================
CREATE POLICY "messages_select_all" ON public.messages FOR SELECT USING (true);
CREATE POLICY "messages_insert_all" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_delete_all" ON public.messages FOR DELETE USING (true);

-- =====================================================
-- STEP 6: Create new RLS policies for SETTINGS
-- =====================================================
CREATE POLICY "settings_select_all" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings_insert_all" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_update_all" ON public.settings FOR UPDATE USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 7: Create new RLS policies for USERS
-- =====================================================
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_insert_all" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_all" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 8: Update default settings with new columns
-- =====================================================
UPDATE public.settings
SET 
  sponsor_photo_url = NULL,
  background_image_url = NULL,
  sponsor_name = 'Parrain du Tournoi'
WHERE id = '1';

-- =====================================================
-- STEP 9: Create updated indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_teams_name ON public.teams(name);
CREATE INDEX IF NOT EXISTS idx_matches_round ON public.matches(round);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =====================================================
-- STEP 10: Verify all tables
-- =====================================================
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- =====================================================
-- IMPORTANT: After running these migrations:
-- 1. Go to Supabase Dashboard
-- 2. Storage > New bucket > Name: "photos" > Make it public
-- 3. Copy your Supabase URL and Anon Key to .env.local
-- =====================================================
