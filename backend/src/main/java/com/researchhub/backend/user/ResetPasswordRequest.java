package com.researchhub.backend.user;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String newPassword;
}
