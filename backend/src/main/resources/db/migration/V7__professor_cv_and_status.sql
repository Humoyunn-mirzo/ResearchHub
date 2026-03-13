-- Add professor status (PENDING until admin approves, CONFIRMED when approved)
-- Add CV file storage for professor sign-up
-- Existing professors default to CONFIRMED

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED';

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS cv_file BYTEA;

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS cv_file_name VARCHAR(255);

ALTER TABLE professors
ADD CONSTRAINT chk_professors_status CHECK (status IN ('PENDING', 'CONFIRMED'));
