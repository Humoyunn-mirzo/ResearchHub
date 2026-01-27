package com.researchhub.backend.application;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/// Receives base64-encoded CV data and filename via POST
/// Validates the application ID from the URL
/// Updates the applications table with the CV URL
/// Returns success confirmation
/// Route: POST /api/applications/:id/upload-cv

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<?> uploadCv(
            @PathVariable UUID id,
            @Valid @RequestBody UploadCvRequest request
    ) {
        ApplicationCvResponse response =
                applicationService.uploadCv(id, request);

        return ResponseEntity.ok(response);
    }
}
