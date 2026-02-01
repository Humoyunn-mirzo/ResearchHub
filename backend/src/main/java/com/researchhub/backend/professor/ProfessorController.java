package com.researchhub.backend.professor;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
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
    public ApiResponsePage<Professor> getProfessors(
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
        return new ApiResponsePage<>(professorService.getProfessors(
            pageable,
            search,
            universityId,
            fieldOfStudy
        ));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Professor> createProfessor(@RequestBody CreateProfessorRequest request) {
        return new ApiResponse<>(professorService.createProfessor(request));
    }

    @GetMapping("/{id}") ///This endpoint gets professor PLUS all of their projects (Orchids)
    /// If you need only professor you can get it from response DTO
    public ApiResponse<ProfessorWithProjectsResponse> getProfessorById(@PathVariable UUID id) {
        return new ApiResponse<>(professorService.getProfessorWithProjects(id));
    }
}
