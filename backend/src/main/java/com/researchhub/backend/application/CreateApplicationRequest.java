package com.researchhub.backend.application;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateApplicationRequest {
    private UUID projectId;
    private String cvFile;
    private List<String> screeningAnswers;
}
