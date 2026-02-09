package com.researchhub.backend.student;

import lombok.Data;

import java.util.UUID;


@Data
public class UpdateStudentRequest {
    private String name;
    private UUID universityId;
    private String fieldOfInterest;
    private String bio;
}
