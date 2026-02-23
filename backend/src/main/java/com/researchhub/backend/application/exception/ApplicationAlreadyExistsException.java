package com.researchhub.backend.application.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class ApplicationAlreadyExistsException extends ApiException  {
    public ApplicationAlreadyExistsException(UUID studentId, UUID projectId) {
        super(HttpStatus.CONFLICT, "Student (" + studentId + ") already applied to project (" + projectId + ")");
    }
}
