package com.researchhub.backend.professor;

import java.util.UUID;

import lombok.Data;

@Data
public class UpdateProfessorRequest {
    private String name;
    private String fieldOfStudy;
    private UUID universityId;
    private String bio;
}
