package com.researchhub.backend.project;

import com.researchhub.backend.professor.Professor;
import jakarta.persistence.*;
import lombok.*;
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;

import java.util.ArrayList;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
public class Project {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    private Professor professor;  //professor -> many projects

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String field;

    @Column(nullable = false)
    private String regionFocus;

    private String requirements;

    private Integer maxStudents;

    @Column(nullable = false)
    private int currentStudents;

    @Column(nullable = false)
    private String status;

    @Type(JsonType.class) //allows conversion between Java and JsonB
    @Column(columnDefinition = "jsonb") //using TEXT would lose JSON features - good practice
    private List<Map<String, Object>> interviewQuestions;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_tags", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "tag")
    private List<String> tags = new java.util.ArrayList<>();

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
