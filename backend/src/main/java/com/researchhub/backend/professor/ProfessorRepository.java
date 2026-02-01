package com.researchhub.backend.professor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface ProfessorRepository extends JpaRepository<Professor, UUID> {

    @Query("""
        SELECT p FROM Professor p
        WHERE (:search IS NULL OR
               LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(p.fieldOfStudy) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:universityId IS NULL OR p.university.id = :universityId)
          AND (:fieldOfStudy IS NULL OR p.fieldOfStudy = :fieldOfStudy)
    """)
    Page<Professor> findFiltered(
        Pageable pageable,
        @Param("search") String search,
        @Param("universityId") UUID universityId,
        @Param("fieldOfStudy") String fieldOfStudy
    );
}
