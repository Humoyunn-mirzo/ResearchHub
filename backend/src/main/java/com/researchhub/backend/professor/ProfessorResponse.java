package com.researchhub.backend.professor;

import java.util.UUID;

public record ProfessorResponse (
    UUID id,
    String name,
    String email,
    UUID universityId,
    String universityName,
    String fieldOfStudy,
    String bio,
    String title,
    String department,
    String officeLocation,
    String phone,
    String websiteUrl,
    String researchInterests,
    boolean hasProfilePicture,
    int rankingScore,
    int totalProjects,
    int studentsSupervised,
    Double acceptanceRate,
    String professorStatus
) {}
