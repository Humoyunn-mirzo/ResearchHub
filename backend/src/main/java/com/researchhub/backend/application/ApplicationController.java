package com.researchhub.backend.application;

import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.common.ApiResponsePage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // ========== Basic CRUD ==========

    @GetMapping
    public ResponseEntity<ApiResponsePage<ApplicationResponse>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<ApplicationResponse> applications = applicationService.getApplications(pageable);
        return ResponseEntity.ok(new ApiResponsePage<>(applications));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> createApplication(@RequestBody CreateApplicationRequest request) {
        ApplicationResponse response = applicationService.createApplication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationById(@PathVariable UUID id) {
        ApplicationResponse response = applicationService.getApplicationById(id);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplication(
            @PathVariable UUID id,
            @RequestBody UpdateApplicationRequest request
    ) {
        ApplicationResponse response = applicationService.updateApplication(id, request);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable UUID id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Custom endpoints ==========

    @GetMapping("/my-projects")
    public ResponseEntity<ApiResponsePage<ApplicationResponse>> getApplicationsForProfessorProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<ApplicationResponse> applications = applicationService.getApplicationsForProfessorProjects(pageable);
        return ResponseEntity.ok(new ApiResponsePage<>(applications));
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<ApiResponsePage<ApplicationResponse>> getApplicationsByStudent(
            @PathVariable UUID studentId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<ApplicationResponse> applications = applicationService.getApplicationsByStudent(studentId, status, pageable);
        return ResponseEntity.ok(new ApiResponsePage<>(applications));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponsePage<ApplicationResponse>> getApplicationsByProject(
            @PathVariable UUID projectId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<ApplicationResponse> applications = applicationService.getApplicationsByProject(projectId, status, pageable);
        return ResponseEntity.ok(new ApiResponsePage<>(applications));
    }
}
