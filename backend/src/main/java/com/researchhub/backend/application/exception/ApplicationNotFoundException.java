package com.researchhub.backend.application.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class ApplicationNotFoundException extends ApiException  {
    public ApplicationNotFoundException(UUID id) {
        super(
            HttpStatus.NOT_FOUND,
            "Application not found with id: " + id
        );
    }
}
