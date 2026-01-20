package com.researchhub.backend.student;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "students",
        indexes = {
                @Index(name = "idx_students_email", columnList = "email", unique = true)
        }
)
@Getter
@Setter
public class Student {
    //I chose not to use @OneToMany to application, but instead made a query in applicationrepository
    //this way, there is more control over the relationship and query and its faster and more efficient.
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    @Column(name = "university_id")
    private UUID universityId;

    @Column(name = "field_of_interest", columnDefinition = "TEXT", nullable = false)
    private String fieldOfInterest;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String bio;

    @Column(name = "total_applications", nullable = false)
    private int totalApplications = 0;

    @Column(name = "accepted_projects", nullable = false)
    private int acceptedProjects = 0;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
