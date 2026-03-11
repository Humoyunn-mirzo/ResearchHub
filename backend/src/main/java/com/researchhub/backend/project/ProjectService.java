package com.researchhub.backend.project;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.professor.ProfessorRepository;
import com.researchhub.backend.professor.exception.ProfessorNotFoundException;
import com.researchhub.backend.project.exception.ProjectNotFoundException;
import com.researchhub.backend.security.CurrentUserService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProfessorRepository professorRepository;
    private final ProjectMapper projectMapper;
    private final CurrentUserService currentUserService;

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
        Professor professor = currentUserService.getCurrentProfessorOrNull();
        if (professor == null) {
            throw new AccessDeniedException("Only professors can create projects");
        }

        Project project = projectMapper.toEntity(request);
        project.setProfessor(professor);

        if (project.getField() == null || project.getField().isBlank()) {
            project.setField("General");
        }
        if (project.getRegionFocus() == null || project.getRegionFocus().isBlank()) {
            project.setRegionFocus("Central Asia");
        }

        project = projectRepository.save(project);

        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));

        Professor currentProfessor = currentUserService.getCurrentProfessorOrNull();
        if (currentProfessor == null || project.getProfessor() == null
                || !project.getProfessor().getId().equals(currentProfessor.getId())) {
            throw new AccessDeniedException("You can only update your own projects");
        }

        projectMapper.toEntity(request, project);

        project = projectRepository.save(project);

        return projectMapper.toResponse(project);
    }

    @Transactional
    public void deleteProject(UUID id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));

        Professor currentProfessor = currentUserService.getCurrentProfessorOrNull();
        if (currentProfessor == null || project.getProfessor() == null
                || !project.getProfessor().getId().equals(currentProfessor.getId())) {
            throw new AccessDeniedException("You can only delete your own projects");
        }

        projectRepository.deleteById(id);
    }
}
