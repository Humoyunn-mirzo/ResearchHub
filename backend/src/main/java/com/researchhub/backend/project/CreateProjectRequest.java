package com.researchhub.backend.project;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import lombok.Data;


@Data
public class CreateProjectRequest {
    private UUID professorId;
    private String title;
    private String description;
    private String field;
    private String regionFocus;
    private String requirements;
    private Integer maxStudents;
    private String status;
    private List<Map<String, Object>> interviewQuestions;
}
