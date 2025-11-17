package com.researchhub.backend.auth;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String refreshToken;
}
