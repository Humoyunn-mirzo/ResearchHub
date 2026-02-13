package com.researchhub.backend.application;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateApplicationRequest {
    private UUID projectId;
    private String cvFile;
}
