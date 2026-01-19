package com.researchhub.backend.application;

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
