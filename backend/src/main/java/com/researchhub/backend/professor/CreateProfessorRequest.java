package com.researchhub.backend.professor;

import java.util.UUID;

public record CreateProfessorRequest(
        String name,
        String email,
        String fieldOfStudy,
        UUID universityId,
        String bio,
        Double acceptanceRate
) {}
