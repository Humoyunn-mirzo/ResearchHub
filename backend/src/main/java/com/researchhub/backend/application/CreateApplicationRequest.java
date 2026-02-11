package com.researchhub.backend.application;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateApplicationRequest {
    private UUID studentId;
    private UUID projectId;
    private ApplicationStatus status; // optional, will default to PENDING if not provided
}