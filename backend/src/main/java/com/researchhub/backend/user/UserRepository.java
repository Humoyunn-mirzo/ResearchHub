package com.researchhub.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);

    @Query(value = "SELECT COUNT(*) FROM user_roles WHERE role = 'DEVELOPER'", nativeQuery = true)
    long countDevelopers();

    @Query(value = "SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = :role", nativeQuery = true)
    long countByRole(@Param("role") String role);
}
