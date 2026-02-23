package com.researchhub.backend.student.exception;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class StudentAlreadyExistsException extends ApiException  {
    public StudentAlreadyExistsException(String email) {
        super(HttpStatus.CONFLICT, "Student already exists with email: " + email);
    }
}
