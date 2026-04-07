package com.researchhub.backend.messaging;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String body,
        OffsetDateTime createdAt
) {}
