package com.researchhub.backend.auth;

import lombok.Data;

@Data
public class BootstrapRequest {
    private String email;
    private String password;
}
