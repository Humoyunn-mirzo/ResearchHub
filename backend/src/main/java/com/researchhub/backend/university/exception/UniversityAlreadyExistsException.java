package com.researchhub.backend.university.exception;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class UniversityAlreadyExistsException extends ApiException  {
    public UniversityAlreadyExistsException(String name) {
        super(HttpStatus.CONFLICT, "University already exists with name: " + name);
    }
}
