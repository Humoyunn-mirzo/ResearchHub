package com.researchhub.backend.university;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/universities")
@RequiredArgsConstructor
public class UniversityController {

    private final UniversityService universityService;

    // GET /universities?search=&country=&region=&limit=&offset=
    @GetMapping
    public ResponseEntity<List<University>> getUniversities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return ResponseEntity.ok(universityService.getUniversities(search, country, region, limit, offset));
    }

    // POST /universities
    @PostMapping
    public ResponseEntity<University> createUniversity(@RequestBody UniversityRequest request) {
        University university = universityService.createUniversity(
                request.getName(),
                request.getCountry(),
                request.getRegion()
        );
        return ResponseEntity.status(201).body(university);
    }

    // GET /universities/{id}
    @GetMapping("/{id}")
    public ResponseEntity<University> getUniversity(@PathVariable UUID id) {
        University university = universityService.getUniversityById(id);
        return ResponseEntity.ok(university);
    }

    // DTO for create request

}
