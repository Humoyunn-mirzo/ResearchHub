package com.researchhub.backend.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

/**
 * DTO that matches the frontend's expected User shape (loosely).
 * Backend does not yet persist name/universityId/createdAt, so we provide best-effort values for local dev.
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthUserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String universityId;
    private String createdAt;
}

