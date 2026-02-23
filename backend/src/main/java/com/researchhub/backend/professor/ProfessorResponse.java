package com.researchhub.backend.professor;

import java.util.UUID;

public record ProfessorResponse (
    UUID id,
    String name,
    String email,
    UUID universityId,
    String fieldOfStudy,
    String bio,
    int rankingScore,
    int totalProjects,
    int studentsSupervised,
    Double acceptanceRate
) {}
