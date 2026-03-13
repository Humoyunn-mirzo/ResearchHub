package com.researchhub.backend.project;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ProjectResponse (
    UUID id,
    UUID professorId,

    String title,
    String description,

    String field,
    String regionFocus,
    String requirements,

    Integer maxStudents,
    int currentStudents,

    String status,
    List<Map<String, Object>> interviewQuestions,
    List<String> tags
) {}
