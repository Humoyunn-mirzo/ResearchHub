package com.researchhub.backend.project;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.professor.ProfessorStatus;
import com.researchhub.backend.professor.ProfessorRepository;
import com.researchhub.backend.admin.AdminModerateProjectRequest;
import com.researchhub.backend.project.exception.ProjectNotFoundException;
import com.researchhub.backend.security.CurrentUserService;
import com.researchhub.backend.topic.ResearchTopicService;

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
    private final ResearchTopicService researchTopicService;

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
            List<String> deduped = dedupeTagList(request.getTags());
            researchTopicService.assertValidProjectTags(deduped);
            project.getTags().clear();
            project.getTags().addAll(deduped);
        } else {
            throw new IllegalArgumentException("Select at least one research topic.");
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

        if (request.getTags() != null && request.getTags().isPresent()) {
            List<String> tagList = request.getTags().get();
            if (tagList.isEmpty()) {
                throw new IllegalArgumentException("Select at least one research topic.");
            }
            List<String> deduped = dedupeTagList(tagList);
            researchTopicService.assertValidProjectTags(deduped);
            project.getTags().clear();
            project.getTags().addAll(deduped);
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

    @Transactional
    public void deleteProjectAsAdmin(UUID id) {
        requirePlatformAdmin();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse closeProjectAsAdmin(java.util.UUID id) {
        requirePlatformAdmin();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
        project.setStatus("CLOSED");
        project = projectRepository.save(project);
        return projectMapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse moderateProjectAsAdmin(java.util.UUID id, AdminModerateProjectRequest request) {
        requirePlatformAdmin();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            List<String> deduped = dedupeTagList(request.getTags());
            researchTopicService.assertValidProjectTags(deduped);
            project.getTags().clear();
            project.getTags().addAll(deduped);
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String s = request.getStatus().trim().toUpperCase();
            if (!"OPEN".equals(s) && !"CLOSED".equals(s)) {
                throw new IllegalArgumentException("status must be OPEN or CLOSED");
            }
            project.setStatus(s);
        }
        project = projectRepository.save(project);
        return projectMapper.toResponse(project);
    }

    private void requirePlatformAdmin() {
        if (!currentUserService.isDeveloperOrUniversityAdmin()) {
            throw new AccessDeniedException("Admin only");
        }
    }

    private static List<String> dedupeTagList(List<String> tags) {
        LinkedHashSet<String> set = new LinkedHashSet<>();
        for (String t : tags) {
            if (t != null) {
                String trimmed = t.trim();
                if (!trimmed.isEmpty()) {
                    set.add(trimmed);
                }
            }
        }
        return new ArrayList<>(set);
    }
}
