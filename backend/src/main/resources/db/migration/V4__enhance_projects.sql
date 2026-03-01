-- Add missing columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS field VARCHAR(255) NOT NULL DEFAULT 'General',
ADD COLUMN IF NOT EXISTS region_focus VARCHAR(255) NOT NULL DEFAULT 'Central Asia',
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS max_students INTEGER,
ADD COLUMN IF NOT EXISTS current_students INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS interview_questions JSONB,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add timestamps to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add timestamps to universities table if it exists
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
