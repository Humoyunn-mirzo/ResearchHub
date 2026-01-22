package com.researchhub.backend.common;

// import java.time.Instant;

public class ApiResponse<T> {

    private T data;
    // private Instant timestamp = Instant.now();

    public ApiResponse(T data) {
        this.data = data;
    }

    public T getData() {
        return data;
    }

    // public Instant getTimestamp() {
    //     return timestamp;
    // }
}

