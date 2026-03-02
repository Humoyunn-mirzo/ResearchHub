package com.researchhub.backend.auth;

import lombok.Data;

@Data
public class AuthRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String universityId;
}
