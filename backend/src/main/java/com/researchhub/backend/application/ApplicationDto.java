package com.researchhub.backend.application;

import com.researchhub.backend.project.Project;
import com.researchhub.backend.user.User;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ApplicationDto {
    private UUID id;
    private UUID projectId;
    private UUID studentId;
    private ApplicationStatus status;
    private String motivation;
    private Instant createdAt;
    private Instant updatedAt;
    private StudentInfo student;
    private ProjectInfo project;

    @Data
    public static class StudentInfo {
        private String id;
        private String name;
        private String email;
    }

    @Data
    public static class ProjectInfo {
        private String id;
        private String title;
    }

    public static StudentInfo toStudentInfo(User user) {
        if (user == null) return null;
        StudentInfo info = new StudentInfo();
        info.setId(user.getId().toString());
        info.setName(user.getEmail());
        info.setEmail(user.getEmail());
        return info;
    }

    public static ProjectInfo toProjectInfo(Project p) {
        if (p == null) return null;
        ProjectInfo info = new ProjectInfo();
        info.setId(p.getId().toString());
        info.setTitle(p.getTitle());
        return info;
    }
}
