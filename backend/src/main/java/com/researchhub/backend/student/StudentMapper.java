package com.researchhub.backend.student;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")//, uses = UniversityMapper.class)
public interface StudentMapper {
    @Mapping(
        target = "universityId",
        expression = "java(student.getUniversity() != null ? student.getUniversity().getId() : null)"
    )
    StudentResponse toResponse(Student student);

    default List<StudentResponse> toResponseList(List<Student> students) {
        return students.stream()
            .map(this::toResponse)
            .toList(); 
    }

    // @Mapping(target = "id", ignore = true)
    // @Mapping(target = "roles", ignore = true)
    // @Mapping(target = "university", ignore = true)
    // @Mapping(target = "totalApplications", ignore = true)
    // @Mapping(target = "acceptedProjects", ignore = true)
    // @Mapping(target = "createdAt", ignore = true)
    // @Mapping(target = "updatedAt", ignore = true)
    Student toEntity(CreateStudentRequest request);

    // @Mapping(target = "id", ignore = true)
    // @Mapping(target = "roles", ignore = true)
    // @Mapping(target = "university", ignore = true)
    // @Mapping(target = "totalApplications", ignore = true)
    // @Mapping(target = "acceptedProjects", ignore = true)
    // @Mapping(target = "createdAt", ignore = true)
    // @Mapping(target = "updatedAt", ignore = true)
    Student toEntity(UpdateStudentRequest request);
}

