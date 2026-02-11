package com.researchhub.backend.university;

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
@RequestMapping("/universities")
@RequiredArgsConstructor
public class UniversityController {

    private final UniversityService universityService;

    @GetMapping
    public ResponseEntity<ApiResponsePage<UniversityResponse>> getUniversities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("name").descending()
        );

        Page<UniversityResponse> universities =
                universityService.getUniversities(pageable);

        return ResponseEntity.ok(new ApiResponsePage<>(universities));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UniversityResponse>> createUniversity(
            @RequestBody CreateUniversityRequest request
    ) {
        UniversityResponse response =
                universityService.createUniversity(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UniversityResponse>> getUniversityById(
            @PathVariable UUID id
    ) {
        UniversityResponse response =
                universityService.getUniversityById(id);

        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UniversityResponse>> updateUniversity(
            @PathVariable UUID id,
            @RequestBody UpdateUniversityRequest request
    ) {
        UniversityResponse response =
                universityService.updateUniversity(id, request);

        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUniversity(@PathVariable UUID id) {
        universityService.deleteUniversity(id);
        return ResponseEntity.noContent().build();
    }
}
