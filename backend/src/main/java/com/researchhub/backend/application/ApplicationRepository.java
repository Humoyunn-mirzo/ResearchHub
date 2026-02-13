package com.researchhub.backend.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    @Query("SELECT a FROM Application a WHERE " +
            "(:projectId IS NULL OR a.projectId = :projectId) " +
            "AND (:studentId IS NULL OR a.studentId = :studentId) " +
            "AND (:status IS NULL OR a.status = :status)")
    Page<Application> findFiltered(@Param("projectId") UUID projectId,
                                   @Param("studentId") UUID studentId,
                                   @Param("status") ApplicationStatus status,
                                   Pageable pageable);

    boolean existsByProjectIdAndStudentId(UUID projectId, UUID studentId);

    Optional<Application> findByProjectIdAndStudentId(UUID projectId, UUID studentId);
}
