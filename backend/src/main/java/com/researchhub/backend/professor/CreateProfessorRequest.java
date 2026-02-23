package com.researchhub.backend.professor;

import java.util.UUID;

import lombok.Data;

@Data
public class CreateProfessorRequest {
    private String email;
    private String password;
    private String name;
    private String fieldOfStudy;
    private UUID universityId;
    private String bio;
}
