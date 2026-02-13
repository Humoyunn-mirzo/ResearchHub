package com.researchhub.backend.application;

import com.researchhub.backend.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    public ApplicationController(ApplicationService applicationService, UserRepository userRepository) {
        this.applicationService = applicationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApplicationService.ApplicationsPage> list(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        var pageResult = applicationService.list(projectId, studentId, status, page, limit);
        return ResponseEntity.ok(pageResult);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDto> getById(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(applicationService.getById(id, userId));
    }

    @PostMapping
    public ResponseEntity<ApplicationDto> create(@Valid @RequestBody CreateApplicationRequest req) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(applicationService.create(userId, req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationDto> updateStatus(@PathVariable UUID id, @RequestBody UpdateStatusRequest req) {
        UUID userId = getCurrentUserId();
        if (req == null || req.getStatus() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(applicationService.updateStatus(id, userId, req.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> withdraw(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        applicationService.withdraw(id, userId);
        return ResponseEntity.noContent().build();
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

    @lombok.Data
    public static class UpdateStatusRequest {
        private ApplicationStatus status;
    }
}
