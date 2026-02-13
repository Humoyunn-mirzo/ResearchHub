package com.researchhub.backend.project;

import com.researchhub.backend.user.User;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class ProjectDto {
    private UUID id;
    private String title;
    private String description;
    private UUID professorId;
    private ProjectStatus status;
    private int slots;
    private List<String> tags;
    private Instant createdAt;
    private ProfessorInfo professor;

    @Data
    public static class ProfessorInfo {
        private String id;
        private String name;
        private String email;
    }

    public static ProfessorInfo toProfessorInfo(User user) {
        if (user == null) return null;
        ProfessorInfo info = new ProfessorInfo();
        info.setId(user.getId().toString());
        info.setName(user.getEmail()); // backend doesn't store names yet
        info.setEmail(user.getEmail());
        return info;
    }
}
