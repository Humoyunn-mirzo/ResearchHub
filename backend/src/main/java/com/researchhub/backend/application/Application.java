package com.researchhub.backend.application;

import com.researchhub.backend.project.ResearchProject;
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
    private Student student;  //a student can have many applications
    /*Here student is just for the ORM - the application.java owns the relationship
    * to keep Student object light. This way we can keep lazy fetching
    * and also allow the ORM to do its job for efficiency in speed and coding.
    * However, the SQL uses the ID unlike JPA/hibernate*/

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ResearchProject researchProject;  //a research project -> Many applications

    @Column(name = "status", nullable = false, length = 50)
    private String status = "pending"; //change to enum later

    @Column(name = "cv_url", columnDefinition = "TEXT")
    private String cvUrl;

    @Column(name = "applied_at", nullable = false)
    private OffsetDateTime appliedAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
