package com.researchhub.backend.student.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class StudentNotFoundException extends ApiException  {
    public StudentNotFoundException(UUID id) {
        super(
            HttpStatus.NOT_FOUND,
            "Student not found with id: " + id
        );
    }

    public StudentNotFoundException(String email) {
        super(
            HttpStatus.NOT_FOUND,
            "Student not found with email: " + email
        );
    }
}
