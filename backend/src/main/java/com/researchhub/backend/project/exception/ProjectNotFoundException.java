package com.researchhub.backend.project.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class ProjectNotFoundException extends ApiException  {
    public ProjectNotFoundException(UUID id) {
        super(
            HttpStatus.NOT_FOUND,
            "Project not found with id: " + id
        );
    }
}
