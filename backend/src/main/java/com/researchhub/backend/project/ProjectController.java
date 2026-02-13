package com.researchhub.backend.project;

import com.researchhub.backend.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    public ProjectController(ProjectService projectService, UserRepository userRepository) {
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ProjectService.ProjectsPage> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) UUID professorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        // professorId filter requires auth - for now allow unauthenticated list
        var pageResult = projectService.list(search, tags, status, professorId, page, limit, sort);
        return ResponseEntity.ok(pageResult);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody CreateProjectRequest req) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(projectService.create(userId, req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectDto> update(@PathVariable UUID id, @Valid @RequestBody UpdateProjectRequest req) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(projectService.update(id, userId, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        projectService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ProjectDto> close(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(projectService.close(id, userId));
    }

    private UUID getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .map(u -> u.getId())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User not found"));
    }
}
