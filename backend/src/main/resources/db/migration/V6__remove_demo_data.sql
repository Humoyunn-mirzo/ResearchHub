-- Remove demo/example data for production
-- Deletes demo professor (demo@researchhub.local) and associated projects

DELETE FROM project_tags
WHERE project_id IN (SELECT id FROM projects WHERE professor_id = 'a1111111-1111-1111-1111-111111111111'::uuid);

DELETE FROM applications
WHERE project_id IN (SELECT id FROM projects WHERE professor_id = 'a1111111-1111-1111-1111-111111111111'::uuid);

DELETE FROM projects WHERE professor_id = 'a1111111-1111-1111-1111-111111111111'::uuid;

DELETE FROM professors WHERE id = 'a1111111-1111-1111-1111-111111111111'::uuid;

DELETE FROM user_roles WHERE user_id = 'a1111111-1111-1111-1111-111111111111'::uuid;

DELETE FROM refresh_tokens WHERE user_id = 'a1111111-1111-1111-1111-111111111111'::uuid;

DELETE FROM users WHERE email = 'demo@researchhub.local';
