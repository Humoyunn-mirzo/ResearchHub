package com.researchhub.backend.project;

import lombok.Data;

import java.util.Map;


@Data
public class UpdateProjectRequest {
    private String title;
    private String description;
    private String field;
    private String regionFocus;
    private String requirements;
    private Integer maxStudents;
    private String status;
    private Map<String, Object> interviewQuestions;
}
