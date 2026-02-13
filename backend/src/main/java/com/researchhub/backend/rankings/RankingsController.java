package com.researchhub.backend.rankings;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rankings")
public class RankingsController {

    private final RankingsService rankingsService;

    public RankingsController(RankingsService rankingsService) {
        this.rankingsService = rankingsService;
    }

    @GetMapping
    public List<RankingEntry> getRankings(@RequestParam(defaultValue = "projects") String category) {
        return switch (category) {
            case "students" -> rankingsService.getTopStudents();
            case "professors" -> rankingsService.getTopProfessors();
            case "projects" -> rankingsService.getTopProjects();
            case "universities" -> rankingsService.getTopUniversities();
            default -> rankingsService.getTopProjects();
        };
    }
}
