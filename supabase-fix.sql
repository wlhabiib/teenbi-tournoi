-- ============================================
-- CORRECTION COMPLETE SUPABASE - TOURNOI TEENBI
-- ============================================

-- 1. SUPPRIMER LES ANCIENNES POLITIQUES (pour éviter les conflits)
DROP POLICY IF EXISTS "Allow anonymous insert" ON users;
DROP POLICY IF EXISTS "Allow anonymous select" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON users;
DROP POLICY IF EXISTS "Enable select for anonymous users" ON users;

-- 2. TABLE USERS - CRÉATION
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY "Enable insert for anonymous users" 
  ON users FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable select for anonymous users" 
  ON users FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- 3. TABLE VOTES - CRÉATION
DROP TABLE IF EXISTS votes CASCADE;
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index unique pour éviter les doublons
CREATE UNIQUE INDEX idx_votes_user_id ON votes(user_id);

-- Activer RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Politiques pour votes
CREATE POLICY "Enable all for votes" 
  ON votes FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 4. TABLE TEAMS - CRÉATION
DROP TABLE IF EXISTS teams CASCADE;
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coach TEXT,
  players TEXT[],
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for teams" 
  ON teams FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 5. TABLE MATCHES - CRÉATION
DROP TABLE IF EXISTS matches CASCADE;
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_home TEXT NOT NULL,
  team_away TEXT NOT NULL,
  score_home INTEGER,
  score_away INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  round TEXT,
  match_date TIMESTAMP WITH TIME ZONE,
  scorers_home TEXT,
  scorers_away TEXT,
  assists_home TEXT,
  assists_away TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for matches" 
  ON matches FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 6. TABLE SETTINGS - CRÉATION
DROP TABLE IF EXISTS settings CASCADE;
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT '1',
  tournament_name TEXT DEFAULT 'Tournoi Teenbi',
  tournament_edition TEXT DEFAULT '5ème Édition',
  tournament_date TEXT,
  location TEXT DEFAULT 'Teenbi',
  sponsor_name TEXT,
  sponsor_about TEXT,
  sponsor_photo_url TEXT,
  show_supporters BOOLEAN DEFAULT true,
  show_top_scorers BOOLEAN DEFAULT true,
  show_voting BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for settings" 
  ON settings FOR ALL 
  TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- Insérer paramètres par défaut
INSERT INTO settings (id) VALUES ('1') ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT 'Tables créées:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Politiques créées:' as info;
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
