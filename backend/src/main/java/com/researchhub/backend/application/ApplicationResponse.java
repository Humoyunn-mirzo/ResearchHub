package com.researchhub.backend.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ApplicationResponse(
    UUID id,
    UUID studentId,
    UUID projectId,
    ApplicationStatus status,
    String cvFile,
    List<String> screeningAnswers,
    OffsetDateTime appliedAt,
    OffsetDateTime updatedAt
) {}
