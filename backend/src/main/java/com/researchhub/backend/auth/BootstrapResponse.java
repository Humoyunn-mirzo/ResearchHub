package com.researchhub.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BootstrapResponse {
    private boolean success;
    private String message;
    private String accessToken;
    private String refreshToken;
    private AuthUserDto user;

    public BootstrapResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
    }
}
