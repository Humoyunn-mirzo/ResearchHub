package com.researchhub.backend.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResearchProjectRepository extends JpaRepository<ResearchProject, UUID> {

    List<ResearchProject> findByProfessorId(UUID professorId);
}
