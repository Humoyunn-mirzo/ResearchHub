package com.researchhub.backend.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private AuthUserDto user;
    private String accessToken;
    private String refreshToken;
}

