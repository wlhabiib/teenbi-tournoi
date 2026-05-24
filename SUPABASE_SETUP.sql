-- =====================================================
-- TEENBI TOURNAMENT SUPABASE SETUP
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor

-- 1. Create TEAMS table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  coach VARCHAR(255),
  players TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create MATCHES table
CREATE TABLE public.matches (
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
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create SETTINGS table
CREATE TABLE public.settings (
  id TEXT PRIMARY KEY DEFAULT '1',
  tournament_name VARCHAR(255) DEFAULT 'Tournoi de Fraternité du Quartier',
  venue VARCHAR(255) DEFAULT 'Quartier Teenbi',
  pitch VARCHAR(255) DEFAULT 'Terrain Teenbi',
  sponsor_photo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for public read access
CREATE POLICY "Enable read access for all users" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.settings FOR SELECT USING (true);

-- 7. Insert default settings
INSERT INTO public.settings (id, tournament_name, venue, pitch)
VALUES ('1', 'Tournoi de Fraternité du Quartier', 'Quartier Teenbi', 'Terrain Teenbi')
ON CONFLICT (id) DO NOTHING;

-- 8. Create storage bucket for photos
-- Do this through Supabase UI: Storage > New bucket > "photos" > Make it public

-- 9. Create indexes
CREATE INDEX idx_matches_round ON public.matches(round);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- =====================================================
-- Done! Your Supabase database is ready.
-- =====================================================
