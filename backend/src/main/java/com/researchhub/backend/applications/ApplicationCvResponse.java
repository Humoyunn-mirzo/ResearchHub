package com.researchhub.backend.applications;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApplicationCvResponse {
    private boolean success;
    private String cvUrl;
    private String fileName;
    private String message;
}
