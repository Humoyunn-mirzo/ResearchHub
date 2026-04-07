-- Direct messaging: one row per (student, professor) pair

CREATE TABLE message_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    student_last_read_at TIMESTAMPTZ,
    professor_last_read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_message_conversations_pair UNIQUE (student_id, professor_id),
    CONSTRAINT chk_message_conversations_distinct CHECK (student_id <> professor_id)
);

CREATE INDEX idx_message_conversations_student ON message_conversations (student_id);
CREATE INDEX idx_message_conversations_professor ON message_conversations (professor_id);
CREATE INDEX idx_message_conversations_updated ON message_conversations (updated_at DESC);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES message_conversations (id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_messages_body_length CHECK (char_length(body) <= 5000 AND char_length(body) >= 1)
);

CREATE INDEX idx_messages_conversation_created ON messages (conversation_id, created_at DESC);
