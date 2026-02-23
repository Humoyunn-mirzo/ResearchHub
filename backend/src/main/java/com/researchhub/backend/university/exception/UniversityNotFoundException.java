package com.researchhub.backend.university.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class UniversityNotFoundException extends ApiException  {
    public UniversityNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "University not found with id: " + id);
    }
}
