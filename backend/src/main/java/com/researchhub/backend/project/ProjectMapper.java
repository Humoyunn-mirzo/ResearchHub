package com.researchhub.backend.project;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public abstract class ProjectMapper {
    @Mapping(
        target = "professorId",
        expression = "java(project.getProfessor() != null ? project.getProfessor().getId() : null)"
    )
    public abstract ProjectResponse toResponse(Project project);

    List<ProjectResponse> toResponseList(List<Project> projects) {
        return projects.stream()
            .map(this::toResponse)
            .toList(); 
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "professor", ignore = true)
    @Mapping(target = "currentStudents", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Project toEntity(CreateProjectRequest request);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "professor", ignore = true)
    @Mapping(target = "currentStudents", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void toEntity(UpdateProjectRequest request, @MappingTarget Project project);
}

