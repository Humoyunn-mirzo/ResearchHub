package com.researchhub.backend.professor.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class ProfessorNotFoundException extends ApiException  {
    public ProfessorNotFoundException(UUID id) {
        super(
            HttpStatus.NOT_FOUND,
            "Professor not found with id: " + id
        );
    }
}
