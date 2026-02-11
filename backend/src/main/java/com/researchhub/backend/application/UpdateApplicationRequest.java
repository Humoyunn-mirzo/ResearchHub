package com.researchhub.backend.application;

import lombok.Data;

@Data
public class UpdateApplicationRequest {
    private ApplicationStatus status; // only updatable field
}