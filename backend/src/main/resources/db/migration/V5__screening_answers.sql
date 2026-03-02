-- Add screening_answers JSONB column to applications
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS screening_answers JSONB;
