CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);
CREATE UNIQUE INDEX idx_users_email ON users(email);



CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role VARCHAR(255),
    CONSTRAINT chk_user_roles_role CHECK (role IN ('DEVELOPER','PROFESSOR','STUDENT','UNIVERSITY_ADMIN')),
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id)
);



CREATE TABLE refresh_tokens (
    id UUID DEFAULT gen_random_uuid(),
    expiry_date TIMESTAMPTZ,
    user_id UUID NOT NULL,
    token VARCHAR(255),
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
);



CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,

    ranking_score INTEGER NOT NULL DEFAULT 0,
    total_projects INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL

    CONSTRAINT chk_universities_counters
        CHECK (
            ranking_score >= 0
            AND total_projects >= 0
        )
);
CREATE UNIQUE INDEX idx_universities_name ON universities(name);



CREATE TABLE students (
    id UUID PRIMARY KEY,

    university_id UUID, --FK to university id

    field_of_interest TEXT,
    bio TEXT,

    total_applications INTEGER NOT NULL DEFAULT 0,
    accepted_projects INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_students_user
            FOREIGN KEY (id)
            REFERENCES users(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_students_university
            FOREIGN KEY (university_id)
            REFERENCES universities(id)
            ON DELETE SET NULL, --if uni deleted the reference will be null, student wont vanish

    CONSTRAINT chk_students_counters
        CHECK (
            total_applications >= 0
            AND accepted_projects >= 0
        )
);



CREATE TABLE professors (
    id UUID PRIMARY KEY,

    university_id UUID,

    field_of_study TEXT NOT NULL,
    bio TEXT,

    ranking_score INTEGER NOT NULL DEFAULT 0,
    total_projects INTEGER NOT NULL DEFAULT 0,
    students_supervised INTEGER NOT NULL DEFAULT 0,
    acceptance_rate REAL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_professors_user
            FOREIGN KEY (id)
            REFERENCES users(id)
            ON DELETE CASCADE,

    CONSTRAINT fk_professors_university
        FOREIGN KEY (university_id)
        REFERENCES universities(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_professors_counters
        CHECK (
            ranking_score >= 0
            AND total_projects >= 0
            AND students_supervised >= 0
        )
);



CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    professor_id UUID,

    title TEXT NOT NULL,
    description TEXT NOT NULL,
    field TEXT NOT NULL,
    region_focus TEXT NOT NULL,

    requirements TEXT,

    max_students INTEGER,
    current_students INTEGER NOT NULL DEFAULT 0,

    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',

    interview_questions JSONB, --using TEXT would lose JSON features - Jsonb good practice

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_projects_professor
        FOREIGN KEY (professor_id)
        REFERENCES professors(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_projects_students
        CHECK (
            max_students IS NULL
            OR max_students >= current_students
        ),

    CONSTRAINT chk_applications_status
        CHECK (status IN ('OPEN', 'CLOSED'))
);



CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    project_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    cv_url TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_applications_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_project FOREIGN KEY (project_id)
        REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT chk_applications_status
        CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED'))
);
