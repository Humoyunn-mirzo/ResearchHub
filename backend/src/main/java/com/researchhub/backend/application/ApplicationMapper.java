package com.researchhub.backend.application;

import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class ApplicationMapper {

    @Mapping(target = "studentId", expression = "java(application.getStudent() != null ? application.getStudent().getId() : null)")
    @Mapping(target = "projectId", expression = "java(application.getProject() != null ? application.getProject().getId() : null)")
    public abstract ApplicationResponse toResponse(Application application);

    public List<ApplicationResponse> toResponseList(List<Application> applications) {
        return applications.stream()
                .map(this::toResponse)
                .toList();
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "cvFile", ignore = true)          // 👈 explicitly ignored (no upload endpoint yet)
    @Mapping(target = "appliedAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Application toEntity(CreateApplicationRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "cvFile", ignore = true)          // 👈 explicitly ignored
    @Mapping(target = "appliedAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void toEntity(UpdateApplicationRequest request, @MappingTarget Application application);

    @AfterMapping
    protected void afterCreate(CreateApplicationRequest request, @MappingTarget Application application) {
        if (request.getStatus() == null) {
            application.setStatus(ApplicationStatus.PENDING);
        }
    }
}