package com.researchhub.backend.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.researchhub.backend.user.User;
import lombok.Data;

import java.time.Instant;

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
    /** PENDING or CONFIRMED - only present when role is PROFESSOR */
    private String professorStatus;

    public static AuthUserDto fromUser(User user) {
        if (user == null) return null;
        AuthUserDto dto = new AuthUserDto();
        dto.setId(user.getId().toString());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName() != null ? user.getName() : user.getEmail());
        var roles = user.getRoles();
        var role = (roles != null && !roles.isEmpty())
                ? roles.iterator().next().name()
                : "STUDENT";
        if ("DEVELOPER".equals(role)) role = "PLATFORM_ADMIN";
        dto.setRole(role);
        dto.setUniversityId(null);
        dto.setCreatedAt(Instant.now().toString());
        if (user instanceof com.researchhub.backend.professor.Professor prof) {
            dto.setProfessorStatus(prof.getStatus() != null ? prof.getStatus().name() : "CONFIRMED");
        }
        return dto;
    }
}

