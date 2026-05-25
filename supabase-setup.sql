-- ============================================
-- CONFIGURATION SUPABASE - TOURNOI TEENBI
-- ============================================

-- 1. TABLE USERS (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ACTIVER RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. POLITIQUES RLS POUR USERS

-- Permettre à tout le monde de s'inscrire (INSERT)
DROP POLICY IF EXISTS "Allow anonymous insert" ON users;
CREATE POLICY "Allow anonymous insert" ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permettre à tout le monde de lire les users (pour connexion)
DROP POLICY IF EXISTS "Allow anonymous select" ON users;
CREATE POLICY "Allow anonymous select" ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Permettre aux users de modifier leur propre compte
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
CREATE POLICY "Allow users to update own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- 4. TABLE VOTES (pour le système de vote)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index unique pour 1 vote par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Activer RLS sur votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Politiques pour votes
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;
CREATE POLICY "Votes are viewable by everyone" ON votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert votes" ON votes;
CREATE POLICY "Authenticated users can insert votes" ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 5. TABLE TEAMS (équipes)
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coach TEXT,
  players TEXT[],
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 6. TABLE MATCHES (matchs)
CREATE TABLE IF NOT EXISTS matches (
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

DROP POLICY IF EXISTS "Matches are viewable by everyone" ON matches;
CREATE POLICY "Matches are viewable by everyone" ON matches
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 7. TABLE SETTINGS (paramètres)
CREATE TABLE IF NOT EXISTS settings (
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

DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
CREATE POLICY "Settings are viewable by everyone" ON settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insérer les paramètres par défaut
INSERT INTO settings (id) VALUES ('1') ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT 'Tables créées avec succès!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
