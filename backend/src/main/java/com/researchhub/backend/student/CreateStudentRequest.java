package com.researchhub.backend.student;

import lombok.Data;

import java.util.UUID;


@Data
public class CreateStudentRequest {
    private String email;
    private String password;
    private String name;
    private UUID universityId;
    private String fieldOfInterest;
    private String bio;
}
