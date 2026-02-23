package com.researchhub.backend.university;

import java.util.UUID;

public record UniversityResponse(
        UUID id,
        String name,
        String country,
        String region,
        Integer rankingScore,
        Integer totalProjects
) {}
