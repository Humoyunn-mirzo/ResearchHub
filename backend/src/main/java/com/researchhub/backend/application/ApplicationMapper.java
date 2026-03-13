package com.researchhub.backend.application;

import org.mapstruct.*;
import org.openapitools.jackson.nullable.JsonNullable;

import com.researchhub.backend.common.GlobalMapperConfig;

import java.util.Base64;
import java.util.List;

@Mapper(config = GlobalMapperConfig.class)
public abstract class ApplicationMapper {

    @Mapping(target = "studentId", expression = "java(application.getStudent() != null ? application.getStudent().getId() : null)")
    @Mapping(target = "projectId", expression = "java(application.getProject() != null ? application.getProject().getId() : null)")
    @Mapping(target = "student", expression = "java(toStudentInfo(application.getStudent()))")
    @Mapping(target = "project", expression = "java(toProjectInfo(application.getProject()))")
    @Mapping(
        target = "cvFile",
        qualifiedByName = "bytesToBase64"
    )
    public abstract ApplicationResponse toResponse(Application application);

    static ApplicationStudentInfo toStudentInfo(com.researchhub.backend.student.Student student) {
        if (student == null) return null;
        return new ApplicationStudentInfo(student.getId(), student.getName(), student.getEmail());
    }

    static ApplicationProjectInfo toProjectInfo(com.researchhub.backend.project.Project project) {
        if (project == null) return null;
        return new ApplicationProjectInfo(project.getId(), project.getTitle());
    }

    public List<ApplicationResponse> toResponseList(List<Application> applications) {
        return applications.stream()
                .map(this::toResponse)
                .toList();
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(
        target = "cvFile",
        qualifiedByName = "base64ToBytes"
    )
    @Mapping(target = "appliedAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Application toEntity(CreateApplicationRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(
        target = "cvFile",
        qualifiedByName = "jsonNullableBase64ToBytes"
    )
    @Mapping(target = "appliedAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void toEntity(UpdateApplicationRequest request, @MappingTarget Application application);


    @Named("base64ToBytes")
    static byte[] base64ToBytes(String base64) {
        if (base64 == null) {
            return null;
        }
        return Base64.getDecoder().decode(base64);
    }

    @Named("jsonNullableBase64ToBytes")
    public byte[] jsonNullableToBytes(JsonNullable<String> nullableBase64) {
        if (nullableBase64 == null || !nullableBase64.isPresent()) {
            return null;
        }
        return base64ToBytes(nullableBase64.get()); // Call the naked function
    }

    @Named("bytesToBase64")
    static String bytesToBase64(byte[] bytes) {
        if (bytes == null) {
            return null;
        }
        return Base64.getEncoder().encodeToString(bytes);
    }
}
