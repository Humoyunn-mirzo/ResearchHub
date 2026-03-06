package com.researchhub.backend.user.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus;

import com.researchhub.backend.common.ApiException;

public class UserNotFoundException extends ApiException {
    public UserNotFoundException(UUID id) {
        super(HttpStatus.NOT_FOUND, "User not found with id: " + id);
    }
}
