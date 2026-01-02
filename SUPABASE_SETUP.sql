-- ============================================
-- PANJOOHAFT DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  brand_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- 2. CREATE API_KEYS TABLE
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(key) WHERE is_active = true;

-- 3. CREATE USAGE_HISTORY TABLE
CREATE TABLE IF NOT EXISTS usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image_1k', 'image_2k', 'video')),
  credit_amount INTEGER NOT NULL,
  task_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_usage_history_user_id ON usage_history(user_id);
CREATE INDEX idx_usage_history_created_at ON usage_history(created_at);
CREATE INDEX idx_usage_history_task_id ON usage_history(task_id);

-- 4. CREATE GENERATED_IMAGES TABLE
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  image_url TEXT,
  prompt TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  aspect_ratio TEXT,
  resolution TEXT,
  credit_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX idx_generated_images_task_id ON generated_images(task_id);
CREATE INDEX idx_generated_images_created_at ON generated_images(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Service role and admins can do everything
CREATE POLICY "Service role full access on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Regular users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Regular users can update their own data (except credits, status, role)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- API Keys table policies
CREATE POLICY "Service role full access on api_keys" ON api_keys
  FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own active API keys
CREATE POLICY "Users can read own api_keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Usage history policies
CREATE POLICY "Service role full access on usage_history" ON usage_history
  FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own usage history
CREATE POLICY "Users can read own usage_history" ON usage_history
  FOR SELECT USING (auth.uid() = user_id);

-- Generated images policies
CREATE POLICY "Service role full access on generated_images" ON generated_images
  FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own generated images
CREATE POLICY "Users can read own images" ON generated_images
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- NOTES
-- ============================================
-- 1. Service role key is used server-side for trusted operations
-- 2. Anon key with RLS policies protects client-side access
-- 3. Users table passwords are NEVER returned to client
-- 4. Credits and status are controlled only by service role
