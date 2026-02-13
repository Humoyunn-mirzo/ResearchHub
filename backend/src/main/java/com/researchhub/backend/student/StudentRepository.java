package com.researchhub.backend.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    boolean existsByEmail(String email);
    Optional<Student> findByEmail(String email);
}
