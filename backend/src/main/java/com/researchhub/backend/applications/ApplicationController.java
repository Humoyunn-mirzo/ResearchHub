package com.researchhub.backend.applications;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<?> uploadCv(
            @PathVariable Long id,
            @Valid @RequestBody UploadCvRequest request
    ) {
        ApplicationCvResponse response =
                applicationService.uploadCv(id, request);

        return ResponseEntity.ok(response);
    }
}
