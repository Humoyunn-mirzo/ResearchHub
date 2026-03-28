package com.researchhub.backend.admin;

import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.project.ProjectResponse;
import com.researchhub.backend.project.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/projects")
@RequiredArgsConstructor
public class AdminProjectController {

    private final ProjectService projectService;

    @DeleteMapping("/{id}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable UUID id) {
        projectService.deleteProjectAsAdmin(id);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ApiResponse<ProjectResponse>> closeProject(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(projectService.closeProjectAsAdmin(id)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> moderate(
            @PathVariable UUID id,
            @RequestBody AdminModerateProjectRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(projectService.moderateProjectAsAdmin(id, request)));
    }
}
