package com.researchhub.backend.professor;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.common.ApiResponsePage;

import java.util.UUID;

@RestController
@RequestMapping("/professors")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;

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

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfessorResponse>> updateProfessor(@PathVariable UUID id, @RequestBody UpdateProfessorRequest request) {
    ProfessorResponse response = professorService.updateProfessor(id, request);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfessor(@PathVariable UUID id) {
        professorService.deleteProfessor(id);
        return ResponseEntity.noContent().build();
    }
}
