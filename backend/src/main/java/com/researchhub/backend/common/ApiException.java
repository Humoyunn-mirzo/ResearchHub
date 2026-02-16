package com.researchhub.backend.common;

import org.springframework.http.HttpStatus;

import lombok.Getter;

public abstract class ApiException extends RuntimeException {
    @Getter
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
