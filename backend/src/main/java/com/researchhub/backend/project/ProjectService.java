package com.researchhub.backend.project;

import com.researchhub.backend.application.Application;
import com.researchhub.backend.application.ApplicationRepository;
import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.professor.ProfessorRepository;
import com.researchhub.backend.university.University;
import com.researchhub.backend.university.UniversityRepository;
import com.researchhub.backend.user.UserRole;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProfessorRepository professorRepository;
    private final ProjectMapper projectMapper;

    public Page<ProjectResponse> getProjects(Pageable pageable) {
        Page<Project> page = projectRepository.findAll(pageable);

        List<ProjectResponse> content = projectMapper.toResponseList(page.getContent());

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public ProjectResponse getProjectById(UUID id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        Professor professor = professorRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Professor not found"));

        Project project = projectMapper.toEntity(request);
        project.setProfessor(professor);

        project = projectRepository.save(project);

        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        projectMapper.toEntity(request, project);

        project = projectRepository.save(project);

        return projectMapper.toResponse(project);
    }

    @Transactional
    public void deleteProject(UUID id) {
        if (!projectRepository.existsById(id)) {
            throw new EntityNotFoundException("Project not found");
        }

        projectRepository.deleteById(id);
    }
}
