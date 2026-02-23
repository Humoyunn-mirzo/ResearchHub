package com.researchhub.backend.common;

import lombok.Getter;

@Getter
public class ApiErrorResponse {
    private final ResponseMeta meta;
    private final ApiError error;

    public ApiErrorResponse(ApiError error) {
        this.meta = new ResponseMeta();
        this.error = error;
    }
}
