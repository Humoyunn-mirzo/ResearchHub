package com.researchhub.backend.common;

import lombok.Getter;

// TODO: maybe inhert ResponseEntity (to add headers/status)
@Getter
public class ApiResponse<T> {
    private final ResponseMeta meta;
    private final T data;

    public ApiResponse(T data) {
        this.meta = new ResponseMeta();
        this.data = data;
    }
}
