package com.researchhub.backend.project;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.professor.ProfessorRepository;
import com.researchhub.backend.professor.exception.ProfessorNotFoundException;
import com.researchhub.backend.project.exception.ProjectNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

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
            .orElseThrow(() -> new ProjectNotFoundException(id));
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        Professor professor = professorRepository.findByEmail(email)
            .orElseThrow(() -> new ProfessorNotFoundException(email));

        Project project = projectMapper.toEntity(request);
        project.setProfessor(professor);

        project = projectRepository.save(project);

        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));

        projectMapper.toEntity(request, project);

        project = projectRepository.save(project);

        return projectMapper.toResponse(project);
    }

    @Transactional
    public void deleteProject(UUID id) {
        if (!projectRepository.existsById(id)) {
            throw new ProjectNotFoundException(id);
        }

        projectRepository.deleteById(id);
    }
}
