package com.researchhub.backend.user;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String name,
    String role,
    UUID universityId
) {}
