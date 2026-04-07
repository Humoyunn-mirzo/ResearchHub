package com.researchhub.backend.messaging;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class StartConversationRequest {
    @NotNull
    private UUID participantId;
}
