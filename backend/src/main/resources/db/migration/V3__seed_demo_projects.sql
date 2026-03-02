-- Demo professor for seed projects (login: demo@researchhub.local / password: password)
-- BCrypt hash for 'password' with cost 10
INSERT INTO users (id, email, password_hash, name)
VALUES (
    'a1111111-1111-1111-1111-111111111111'::uuid,
    'demo@researchhub.local',
    '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Demo Professor'
)
ON CONFLICT ON CONSTRAINT uq_users_email DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'PROFESSOR' FROM users WHERE email = 'demo@researchhub.local'
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure professors record exists for demo user
INSERT INTO professors (id, field_of_study, created_at, updated_at)
SELECT id, 'Computer Science', NOW(), NOW() FROM users WHERE email = 'demo@researchhub.local'
ON CONFLICT (id) DO NOTHING;

-- Demo projects (only if projects table is empty) - V1 schema uses max_students, field, region_focus
INSERT INTO projects (id, title, description, professor_id, field, region_focus, status, max_students, current_students, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'Machine Learning for Climate Prediction',
    'Join our interdisciplinary team to develop ML models that predict regional climate patterns. We focus on Central Asian and EU datasets. Requirements: Python, basic statistics, interest in environmental science. Expected outcomes: co-authored paper, open-source toolkit.',
    (SELECT id FROM users WHERE email = 'demo@researchhub.local' LIMIT 1),
    'Machine Learning',
    'Central Asia',
    'OPEN',
    3,
    0,
    NOW() - INTERVAL '5 days',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);

INSERT INTO projects (id, title, description, professor_id, field, region_focus, status, max_students, current_students, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'NLP for Policy Analysis',
    'Analyze policy documents and legislative text using natural language processing. The project involves building pipelines for multilingual (English, Russian, Uzbek) document analysis. Prior experience with transformers or NLP is a plus.',
    (SELECT id FROM users WHERE email = 'demo@researchhub.local' LIMIT 1),
    'NLP',
    'Central Asia',
    'OPEN',
    2,
    0,
    NOW() - INTERVAL '3 days',
    NOW()
WHERE (SELECT COUNT(*) FROM projects) < 2;

INSERT INTO projects (id, title, description, professor_id, field, region_focus, status, max_students, current_students, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'Data Visualization for Research Impact',
    'Create interactive dashboards and visualizations to communicate research impact to stakeholders. We use D3.js, React, and modern web technologies. Suitable for students with frontend or data visualization interest.',
    (SELECT id FROM users WHERE email = 'demo@researchhub.local' LIMIT 1),
    'Data Science',
    'Central Asia',
    'OPEN',
    4,
    0,
    NOW() - INTERVAL '1 day',
    NOW()
WHERE (SELECT COUNT(*) FROM projects) < 3;

-- Add tags for demo projects
INSERT INTO project_tags (project_id, tag)
SELECT p.id, 'Machine Learning' FROM projects p WHERE p.title = 'Machine Learning for Climate Prediction'
ON CONFLICT (project_id, tag) DO NOTHING;
INSERT INTO project_tags (project_id, tag)
SELECT p.id, 'Climate' FROM projects p WHERE p.title = 'Machine Learning for Climate Prediction'
ON CONFLICT (project_id, tag) DO NOTHING;
INSERT INTO project_tags (project_id, tag)
SELECT p.id, 'NLP' FROM projects p WHERE p.title = 'NLP for Policy Analysis'
ON CONFLICT (project_id, tag) DO NOTHING;
INSERT INTO project_tags (project_id, tag)
SELECT p.id, 'Policy' FROM projects p WHERE p.title = 'NLP for Policy Analysis'
ON CONFLICT (project_id, tag) DO NOTHING;
INSERT INTO project_tags (project_id, tag)
SELECT p.id, 'Data Visualization' FROM projects p WHERE p.title = 'Data Visualization for Research Impact'
ON CONFLICT (project_id, tag) DO NOTHING;
INSERT INTO project_tags (project_id, tag)
SELECT p.id, 'Research Impact' FROM projects p WHERE p.title = 'Data Visualization for Research Impact'
ON CONFLICT (project_id, tag) DO NOTHING;
