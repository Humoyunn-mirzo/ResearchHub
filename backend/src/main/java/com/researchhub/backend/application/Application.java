package com.researchhub.backend.application;

import com.researchhub.backend.project.Project;
import com.researchhub.backend.student.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "applications")
@Getter
@Setter
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(name = "cv_file", columnDefinition = "BYTEA")
    private byte[] cvFile;                 // 👈 ADDED: maps to cv_file BYTEA column

    @Column(name = "applied_at", nullable = false)
    private OffsetDateTime appliedAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}