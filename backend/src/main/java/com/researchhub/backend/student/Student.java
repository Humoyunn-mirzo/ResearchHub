package com.researchhub.backend.student;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.researchhub.backend.university.University;
import com.researchhub.backend.user.User;

@Entity
@Table(name = "students")
@Getter
@Setter
public class Student extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;

    @Column(name = "field_of_interest", columnDefinition = "TEXT")
    private String fieldOfInterest;

    @Column(columnDefinition = "TEXT")
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
