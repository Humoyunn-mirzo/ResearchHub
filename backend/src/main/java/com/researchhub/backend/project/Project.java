package com.researchhub.backend.project;

import com.researchhub.backend.professor.Professor;
import jakarta.persistence.*;
import lombok.*;
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;



import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private Map<String, Object> interviewQuestions;

    private String titleEn;
    private String titleRu;
    private String titleUz;

    private String descriptionEn;
    private String descriptionRu;
    private String descriptionUz;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;
}
