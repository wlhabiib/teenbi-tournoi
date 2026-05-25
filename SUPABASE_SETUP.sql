-- =====================================================
-- TEENBI TOURNAMENT SUPABASE SETUP
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor

-- Ensure UUID generation function is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Create USERS table (for Custom Auth logic)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. Create TEAMS table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  coach VARCHAR(255),
  players TEXT[] DEFAULT '{}',
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create MATCHES table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_home VARCHAR(255) NOT NULL,
  team_away VARCHAR(255) NOT NULL,
  score_home INTEGER,
  score_away INTEGER,
  scorers_home TEXT,
  scorers_away TEXT,
  assists_home TEXT,
  assists_away TEXT,
  round VARCHAR(100),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create MESSAGES table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create SETTINGS table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT '1',
  tournament_name VARCHAR(255) DEFAULT 'Tournoi de Fraternité du Quartier',
  venue VARCHAR(255) DEFAULT 'Quartier Teenbi',
  pitch VARCHAR(255) DEFAULT 'Terrain Teenbi',
  sponsor_photo_url TEXT,
  sponsor_about TEXT,
  background_photo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assurer que les colonnes existent si les tables ont été créées précédemment sans elles
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS sponsor_photo_url TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS sponsor_about TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS background_photo_url TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 5. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.teams;
CREATE POLICY "Enable read access for all users" ON public.teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.matches;
CREATE POLICY "Enable read access for all users" ON public.matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.messages;
CREATE POLICY "Enable read access for all users" ON public.messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.settings;
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);

-- 7. Insert default settings
INSERT INTO public.settings (id, tournament_name, venue, pitch)
VALUES ('1', 'Tournoi de Fraternité du Quartier', 'Quartier Teenbi', 'Terrain Teenbi')
ON CONFLICT (id) DO NOTHING;

-- 8. Fix pour l'erreur "enregistrement équipe erreur" (Politiques permissives pour l'admin)
DROP POLICY IF EXISTS "Admin full access on users" ON public.users;
CREATE POLICY "Admin full access on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full access on teams" ON public.teams;
CREATE POLICY "Admin full access on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full access on matches" ON public.matches;
CREATE POLICY "Admin full access on matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin full access on settings" ON public.settings;
CREATE POLICY "Admin full access on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- 8. Create storage bucket for photos
-- Do this through Supabase UI: Storage > New bucket > "photos" > Make it public

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_matches_round ON public.matches(round);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_name ON public.teams(name);

-- 10. Create increment_vote function
CREATE OR REPLACE FUNCTION increment_vote(team_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE teams
  SET votes = COALESCE(votes, 0) + 1
  WHERE id = team_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Done! Your Supabase database is ready.
-- =====================================================
