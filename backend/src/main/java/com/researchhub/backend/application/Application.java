package com.researchhub.backend.application;

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
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "pending"; //change to enum later

    @Column(name = "cv_url", columnDefinition = "TEXT")
    private String cvUrl;

    @Column(name = "applied_at", nullable = false)
    private OffsetDateTime appliedAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    // Optional: helper method to update timestamps automatically
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
