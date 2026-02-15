package com.researchhub.backend.project;

import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserRepository;
import com.researchhub.backend.user.UserRole;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProjectsPage list(String search, List<String> tags, ProjectStatus status, UUID professorId,
                             int page, int limit, String sort) {
        Pageable pageable = toPageable(page, limit, sort);
        var result = (tags != null && !tags.isEmpty())
                ? projectRepository.searchWithTags(search, status, professorId, tags, pageable)
                : projectRepository.search(search, status, professorId, pageable);

        List<ProjectDto> dtos = result.getContent().stream()
                .map(this::toDto)
                .toList();

        return new ProjectsPage(dtos, (int) result.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public ProjectDto getById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        return toDtoWithProfessor(project);
    }

    @Transactional
    public ProjectDto create(UUID userId, CreateProjectRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!user.getRoles().contains(UserRole.PROFESSOR)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only professors can create projects");
        }

        Project project = new Project();
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setProfessorId(userId);
        project.setStatus(ProjectStatus.OPEN);
        project.setSlots(req.getSlots());
        project.setTags(req.getTags() != null ? new java.util.HashSet<>(req.getTags()) : new java.util.HashSet<>());
        project = projectRepository.save(project);
        return toDtoWithProfessor(project);
    }

    @Transactional
    public ProjectDto update(UUID id, UUID userId, UpdateProjectRequest req) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.getProfessorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the project owner can update it");
        }

        if (req.getTitle() != null) project.setTitle(req.getTitle());
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getSlots() != null) project.setSlots(req.getSlots());
        if (req.getTags() != null) project.setTags(new java.util.HashSet<>(req.getTags()));
        project = projectRepository.save(project);
        return toDtoWithProfessor(project);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.getProfessorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the project owner can delete it");
        }
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDto close(UUID id, UUID userId) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.getProfessorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the project owner can close it");
        }
        project.setStatus(ProjectStatus.CLOSED);
        project = projectRepository.save(project);
        return toDtoWithProfessor(project);
    }

    private Pageable toPageable(int page, int limit, String sort) {
        // Frontend uses 1-based pages; Spring Pageable uses 0-based
        int zeroBasedPage = page <= 1 ? 0 : page - 1;
        int safePage = Math.max(0, zeroBasedPage);
        int safeLimit = Math.min(50, Math.max(1, limit));
        Sort s = "oldest".equalsIgnoreCase(sort)
                ? Sort.by(Sort.Direction.ASC, "createdAt")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        return PageRequest.of(safePage, safeLimit, s);
    }

    private ProjectDto toDto(Project p) {
        ProjectDto dto = new ProjectDto();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setProfessorId(p.getProfessorId());
        dto.setStatus(p.getStatus());
        dto.setSlots(p.getSlots());
        dto.setTags(p.getTags() != null ? List.copyOf(p.getTags()) : List.of());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setProfessor(null); // not loaded in list
        return dto;
    }

    private ProjectDto toDtoWithProfessor(Project p) {
        ProjectDto dto = toDto(p);
        userRepository.findById(p.getProfessorId())
                .ifPresent(u -> dto.setProfessor(ProjectDto.toProfessorInfo(u)));
        return dto;
    }

    @lombok.Data
    public static class ProjectsPage {
        private final List<ProjectDto> data;
        private final int total;
        private final int page;
        private final int limit;
    }
}
