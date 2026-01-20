CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);



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
    CONSTRAINT pk_refresh_token PRIMARY KEY (id),
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id)
);



CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,

    university_id UUID, --FK to university id

    field_of_interest TEXT,
    bio TEXT,

    total_applications INTEGER NOT NULL DEFAULT 0,
    accepted_projects INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

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
CREATE UNIQUE INDEX idx_students_email ON students(email);



CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    cv_url TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_applications_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE
);


CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,

    ranking_score INTEGER NOT NULL DEFAULT 0,
    total_research_projects INTEGER NOT NULL DEFAULT 0,
    total_students_supported INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE universities
ADD CONSTRAINT chk_universities_counters
CHECK (
    ranking_score >= 0 AND
    total_research_projects >= 0 AND
    total_students_supported >= 0
);
CREATE UNIQUE INDEX idx_universities_name ON universities(name);


