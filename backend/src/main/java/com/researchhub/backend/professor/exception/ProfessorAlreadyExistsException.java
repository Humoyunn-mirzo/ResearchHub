package com.researchhub.backend.professor.exception;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class ProfessorAlreadyExistsException extends ApiException  {
    public ProfessorAlreadyExistsException(String email) {
        super(HttpStatus.CONFLICT, "Professor already exists with email: " + email);
    }
}
