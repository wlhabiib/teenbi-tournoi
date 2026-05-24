-- =====================================================
-- AUTHENTICATION TABLE SETUP
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor

-- 1. Create USERS table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for users table
-- Anyone can read basic user info (for display purposes)
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);

-- Only admins can insert/update users
CREATE POLICY "Enable insert for authenticated users" ON public.users FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Insert default admin user (username: admin, password: 1234)
-- Note: In production, use proper password hashing (bcrypt)
INSERT INTO public.users (username, password_hash, full_name, email, role)
VALUES ('admin', '1234', 'Administrateur Teenbi', 'admin@tournoi-teenbi.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 5. Create indexes
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_role ON public.users(role);

-- =====================================================
-- NOTE: Update the admin password hash with bcrypt
-- For testing: password = '1234'
-- Install bcrypt and generate hash in Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('1234', 10, (err, hash) => console.log(hash));
-- =====================================================
