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
