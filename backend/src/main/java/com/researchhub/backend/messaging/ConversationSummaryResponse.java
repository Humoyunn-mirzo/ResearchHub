package com.researchhub.backend.messaging;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ConversationSummaryResponse(
        UUID id,
        PartyInfoResponse otherParty,
        String lastMessagePreview,
        OffsetDateTime lastMessageAt,
        long unreadCount
) {}
