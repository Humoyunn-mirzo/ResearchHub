package com.researchhub.backend.professor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

import com.researchhub.backend.university.University;
import com.researchhub.backend.user.User;

@Entity
@Table(name = "professors")
@Getter
@Setter
public class Professor extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;   //university -> many professors

    @Column(nullable = false)
    private String fieldOfStudy;

    private String bio;

    /** Academic title, e.g. "Associate Professor". */
    private String title;

    private String department;

    @Column(name = "office_location")
    private String officeLocation;

    @Column(length = 50)
    private String phone;

    @Column(name = "website_url", length = 512)
    private String websiteUrl;

    @Column(name = "research_interests")
    private String researchInterests;

    @Column(nullable = false)
    private int rankingScore;

    @Column(nullable = false)
    private int totalProjects;

    @Column(nullable = false)
    private int studentsSupervised;

    private Double acceptanceRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProfessorStatus status = ProfessorStatus.CONFIRMED;

    @Column(name = "cv_file", columnDefinition = "BYTEA")
    private byte[] cvFile;

    @Column(name = "cv_file_name")
    private String cvFileName;

    @Column(name = "profile_picture", columnDefinition = "BYTEA")
    private byte[] profilePicture;

    @Column(name = "profile_picture_type", length = 100)
    private String profilePictureType;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
