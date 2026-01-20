package com.researchhub.backend.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, UUID> {
    List<Application> findByStudentId(UUID studentId);
}

