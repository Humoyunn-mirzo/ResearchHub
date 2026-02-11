package com.researchhub.backend.project;

import lombok.*;

import java.util.Map;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private UUID professorId;
    private String title;
    private String description;
    private String field;
    private String regionFocus;
    private String requirements;
    private Integer maxStudents;
    private int currentStudents;
    private String status;
    private Map<String, Object> interviewQuestions;
}
