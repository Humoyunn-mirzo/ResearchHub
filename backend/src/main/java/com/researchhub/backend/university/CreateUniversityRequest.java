package com.researchhub.backend.university;

import lombok.Data;

@Data
public class CreateUniversityRequest {
    private String name;
    private String country;
    private String region;
}
