CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    professor_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    slots INT NOT NULL CHECK (slots >= 1 AND slots <= 20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_tags (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (project_id, tag)
);

CREATE TABLE applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    motivation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, student_id)
);

CREATE INDEX idx_projects_professor ON projects(professor_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_applications_project ON applications(project_id);
CREATE INDEX idx_applications_student ON applications(student_id);
