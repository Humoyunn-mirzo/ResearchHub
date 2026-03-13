package com.researchhub.backend.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    Page<Application> findByStudentId(UUID studentId, Pageable pageable);

    Page<Application> findByStudentIdAndStatus(UUID studentId, ApplicationStatus status, Pageable pageable);

    Page<Application> findByProjectId(UUID projectId, Pageable pageable);

    Page<Application> findByProjectIdAndStatus(UUID projectId, ApplicationStatus status, Pageable pageable);

    boolean existsByStudentIdAndProjectId(UUID studentId, UUID projectId);

    long countByStatus(ApplicationStatus status);
}