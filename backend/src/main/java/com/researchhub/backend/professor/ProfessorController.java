package com.researchhub.backend.professor;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.common.ApiResponsePage;
import com.researchhub.backend.security.CurrentUserService;

import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/professors")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<ApiResponsePage<ProfessorResponse>> getProfessors(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) UUID universityId,
        @RequestParam(required = false) String fieldOfStudy
    ) {
        Pageable pageable = PageRequest.of(
            page,
            size,
            Sort.by("name").descending()
        );
        Page<ProfessorResponse> professors = professorService.getProfessors(pageable, search, universityId, fieldOfStudy);
        return ResponseEntity.ok(new ApiResponsePage<>(professors));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProfessorResponse>> createProfessor(@RequestBody CreateProfessorRequest request) {
        ProfessorResponse response = professorService.createProfessor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfessorResponse>> getProfessorById(@PathVariable UUID id) {
        ProfessorResponse response = professorService.getProfessorById(id);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfessorResponse>> updateProfessor(@PathVariable UUID id, @RequestBody UpdateProfessorRequest request) {
        assertCanManageProfile(id);
        ProfessorResponse response = professorService.updateProfessor(id, request);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfessor(@PathVariable UUID id) {
        professorService.deleteProfessor(id);
        return ResponseEntity.noContent().build();
    }

    /** Public avatar image. Returns 404 when the professor has not uploaded one. */
    @GetMapping("/{id}/avatar")
    public ResponseEntity<byte[]> getProfilePicture(@PathVariable UUID id) {
        return professorService.getProfilePicture(id)
                .map(picture -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(picture.contentType()))
                        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePrivate())
                        .body(picture.data()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfessorResponse>> uploadProfilePicture(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {
        assertCanManageProfile(id);
        ProfessorResponse response = professorService.uploadProfilePicture(id, file);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<ApiResponse<ProfessorResponse>> deleteProfilePicture(@PathVariable UUID id) {
        assertCanManageProfile(id);
        ProfessorResponse response = professorService.deleteProfilePicture(id);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    /** Professors may only edit their own profile; admins may edit any. */
    private void assertCanManageProfile(UUID professorId) {
        if (currentUserService.isDeveloperOrUniversityAdmin()) {
            return;
        }
        if (!professorId.equals(currentUserService.getCurrentUserId())) {
            throw new AccessDeniedException("You can only edit your own professor profile");
        }
    }
}
