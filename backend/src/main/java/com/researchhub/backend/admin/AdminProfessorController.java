package com.researchhub.backend.admin;

import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.common.ApiResponsePage;
import com.researchhub.backend.professor.ProfessorResponse;
import com.researchhub.backend.professor.ProfessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/professors")
@RequiredArgsConstructor
public class AdminProfessorController {

    private final ProfessorService professorService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponsePage<ProfessorResponse>> getPendingProfessors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var professors = professorService.getPendingProfessors(pageable);
        return ResponseEntity.ok(new ApiResponsePage<>(professors));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ProfessorResponse>> approveProfessor(@PathVariable UUID id) {
        ProfessorResponse response = professorService.approveProfessor(id);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<byte[]> getProfessorCv(@PathVariable UUID id) {
        var result = professorService.getProfessorCvWithFilename(id);
        String filename = result.filename() != null ? result.filename() : "professor_cv";
        MediaType mediaType = filename.toLowerCase().endsWith(".pdf") ? MediaType.APPLICATION_PDF
                : filename.toLowerCase().endsWith(".doc") || filename.toLowerCase().endsWith(".docx")
                ? MediaType.parseMediaType("application/msword") : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(result.data());
    }
}
