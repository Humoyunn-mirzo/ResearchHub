package com.researchhub.backend.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByProfessorId(UUID professorId);

    Page<Project> findByProfessorId(UUID professorId, Pageable pageable);

    Page<Project> findByProfessorIdAndStatus(UUID professorId, String status, Pageable pageable);

    Page<Project> findByStatus(String status, Pageable pageable);

    @Query("""
        SELECT DISTINCT p FROM Project p
        LEFT JOIN p.tags t
        WHERE (:professorId IS NULL OR p.professor.id = :professorId)
        AND (:status IS NULL OR :status = '' OR p.status = :status)
        AND (:search IS NULL OR :search = '' OR
             LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(t) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Project> findFiltered(
        @Param("professorId") UUID professorId,
        @Param("status") String status,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("""
        SELECT DISTINCT p FROM Project p
        JOIN p.tags t
        WHERE (:professorId IS NULL OR p.professor.id = :professorId)
        AND (:status IS NULL OR :status = '' OR p.status = :status)
        AND (:search IS NULL OR :search = '' OR
             LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(t) LIKE LOWER(CONCAT('%', :search, '%')))
        AND t IN :tags
        """)
    Page<Project> findFilteredWithTags(
        @Param("professorId") UUID professorId,
        @Param("status") String status,
        @Param("search") String search,
        @Param("tags") List<String> tags,
        Pageable pageable
    );
}
