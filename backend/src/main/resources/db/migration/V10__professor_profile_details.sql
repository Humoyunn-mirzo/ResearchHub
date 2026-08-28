-- Extended professor profile: avatar image + richer "more info" fields
-- shown on the professor dashboard and the public professor page.

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS profile_picture BYTEA;

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS profile_picture_type VARCHAR(100);

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS department VARCHAR(255);

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS office_location VARCHAR(255);

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS website_url VARCHAR(512);

ALTER TABLE professors
ADD COLUMN IF NOT EXISTS research_interests TEXT;
