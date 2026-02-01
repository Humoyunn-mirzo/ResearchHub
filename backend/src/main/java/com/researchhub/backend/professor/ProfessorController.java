package com.researchhub.backend.professor;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.researchhub.backend.common.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/professors")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;

    @GetMapping
    public ApiResponse<List<Professor>> getProfessors(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID universityId,
            @RequestParam(required = false) String fieldOfStudy
    ) {
        return new ApiResponse<>(professorService.getProfessors(limit, offset, search, universityId, fieldOfStudy));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Professor createProfessor(@RequestBody CreateProfessorRequest request) {
        return professorService.createProfessor(request);
    }

    @GetMapping("/{id}") ///This endpoint gets professor PLUS all of their projects (Orchids)
    /// If you need only professor you can get it from response DTO
    public ProfessorWithProjectsResponse getProfessorById(@PathVariable UUID id) {
        return professorService.getProfessorWithProjects(id);
    }
}
