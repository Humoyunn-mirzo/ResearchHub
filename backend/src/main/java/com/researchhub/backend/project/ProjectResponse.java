package com.researchhub.backend.project;

import java.util.Map;
import java.util.UUID;

import com.researchhub.backend.professor.Professor;

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
    Map<String, Object> interviewQuestions
) {}
