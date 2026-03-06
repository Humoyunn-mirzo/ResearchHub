package com.researchhub.backend.user;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String role;
}
