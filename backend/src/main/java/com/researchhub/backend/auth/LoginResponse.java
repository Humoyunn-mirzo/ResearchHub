package com.researchhub.backend.auth;

import lombok.Data;

@Data
public class LoginResponse {
    private AuthUserDto user;
    private String accessToken;
    private String refreshToken;

    public LoginResponse(AuthUserDto user, String accessToken, String refreshToken) {
        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}

