package com.researchhub.backend.common;

import lombok.Getter;

public class ApiError {
    @Getter
    private final String message;

    public ApiError(String message) {
        this.message = message;
    }
}
