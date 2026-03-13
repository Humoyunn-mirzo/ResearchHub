package com.researchhub.backend.project;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.professor.ProfessorStatus;
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

    public Page<ProjectResponse> getProjects(Pageable pageable, UUID professorId, String status, String search, List<String> tags) {
        boolean useSearchOrTags = (search != null && !search.isBlank()) || (tags != null && !tags.isEmpty());
        Page<Project> page;
        if (useSearchOrTags) {
            if (tags != null && !tags.isEmpty()) {
                page = projectRepository.findFilteredWithTags(professorId, status, search, tags, pageable);
            } else {
                page = projectRepository.findFiltered(professorId, status, search, pageable);
            }
        } else if (professorId != null && status != null && !status.isBlank()) {
            page = projectRepository.findByProfessorIdAndStatus(professorId, status, pageable);
        } else if (professorId != null) {
            page = projectRepository.findByProfessorId(professorId, pageable);
        } else if (status != null && !status.isBlank()) {
            page = projectRepository.findByStatus(status, pageable);
        } else {
            page = projectRepository.findAll(pageable);
        }
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
        if (professor.getStatus() != com.researchhub.backend.professor.ProfessorStatus.CONFIRMED) {
            throw new AccessDeniedException("Your professor account is pending approval. You can create projects once an admin confirms your registration.");
        }

        Project project = projectMapper.toEntity(request);
        project.setProfessor(professor);

        if (project.getField() == null || project.getField().isBlank()) {
            project.setField("General");
        }
        if (project.getRegionFocus() == null || project.getRegionFocus().isBlank()) {
            project.setRegionFocus("Central Asia");
        }

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            project.getTags().clear();
            project.getTags().addAll(request.getTags());
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
        if (currentProfessor.getStatus() != com.researchhub.backend.professor.ProfessorStatus.CONFIRMED) {
            throw new AccessDeniedException("Your professor account is pending approval.");
        }

        projectMapper.toEntity(request, project);

        if (request.getTags() != null && request.getTags().isPresent() && !request.getTags().get().isEmpty()) {
            project.getTags().clear();
            project.getTags().addAll(request.getTags().get());
        }

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
        if (currentProfessor.getStatus() != com.researchhub.backend.professor.ProfessorStatus.CONFIRMED) {
            throw new AccessDeniedException("Your professor account is pending approval.");
        }

        projectRepository.deleteById(id);
    }

    @Transactional
    public ProjectResponse closeProject(UUID id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));

        Professor currentProfessor = currentUserService.getCurrentProfessorOrNull();
        if (currentProfessor == null || project.getProfessor() == null
                || !project.getProfessor().getId().equals(currentProfessor.getId())) {
            throw new AccessDeniedException("You can only close your own projects");
        }
        if (currentProfessor.getStatus() != com.researchhub.backend.professor.ProfessorStatus.CONFIRMED) {
            throw new AccessDeniedException("Your professor account is pending approval.");
        }

        project.setStatus("CLOSED");
        project = projectRepository.save(project);

        return projectMapper.toResponse(project);
    }
}
