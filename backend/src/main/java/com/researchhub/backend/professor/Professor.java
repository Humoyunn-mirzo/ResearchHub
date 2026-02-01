package com.researchhub.backend.professor;

import com.researchhub.backend.university.University;
import com.researchhub.backend.user.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "professors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Professor extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;   //university -> many professors

    @Column(nullable = false)
    private String fieldOfStudy;

    private String bio;

    @Column(nullable = false)
    private int rankingScore;

    @Column(nullable = false)
    private int totalProjects;

    @Column(nullable = false)
    private int studentsSupervised;

    private Double acceptanceRate;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;
}
