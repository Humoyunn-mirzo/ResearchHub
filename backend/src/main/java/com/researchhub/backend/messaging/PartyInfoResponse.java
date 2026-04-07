package com.researchhub.backend.messaging;

import java.util.UUID;

public record PartyInfoResponse(UUID id, String name, String email, String role) {}
