package com.researchhub.backend.professor;

import com.researchhub.backend.project.Project;

import java.util.List;

public record ProfessorWithProjectsResponse(
        Professor professor,
        List<Project> projects
) {}
