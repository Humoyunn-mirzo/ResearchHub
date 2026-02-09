package com.researchhub.backend.student;

import java.util.UUID;

public record StudentResponse (
    UUID id,
    String name,
    String email,
    UUID universityId,
    String fieldOfInterest,
    String bio
) {}
