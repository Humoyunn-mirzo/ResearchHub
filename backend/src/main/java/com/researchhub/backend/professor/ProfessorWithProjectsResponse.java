package com.researchhub.backend.professor;

import com.researchhub.backend.project.ResearchProject;

import java.util.List;

public record ProfessorWithProjectsResponse(
        Professor professor,
        List<ResearchProject> projects
) {}
