package com.researchhub.backend.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Page<Project> findByProfessorId(UUID professorId, Pageable pageable);

    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);

    Page<Project> findByProfessorIdAndStatus(UUID professorId, ProjectStatus status, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE " +
            "(:search IS NULL OR :search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:professorId IS NULL OR p.professorId = :professorId)")
    Page<Project> search(@Param("search") String search,
                         @Param("status") ProjectStatus status,
                         @Param("professorId") UUID professorId,
                         Pageable pageable);

    @Query("SELECT DISTINCT p FROM Project p JOIN p.tags t WHERE " +
            "(:search IS NULL OR :search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:professorId IS NULL OR p.professorId = :professorId) " +
            "AND t IN :tags")
    Page<Project> searchWithTags(@Param("search") String search,
                                @Param("status") ProjectStatus status,
                                @Param("professorId") UUID professorId,
                                @Param("tags") java.util.List<String> tags,
                                Pageable pageable);
}
