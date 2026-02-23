package com.researchhub.backend.user;

import lombok.Data;

@Data
public class RegisterDeveloperRequest {
    private String email;
    private String password;
}

