package com.researchhub.backend.student;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

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

    private String fieldOfInterest;

    private String bio;

    @Column(nullable = false)
    private int totalApplications = 0;

    @Column(nullable = false)
    private int acceptedProjects = 0;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
