package com.researchhub.backend.student;

import java.util.List;
import java.util.Set;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.researchhub.backend.common.GlobalMapperConfig;
import com.researchhub.backend.user.UserRole;

@Mapper(config = GlobalMapperConfig.class)
public abstract class StudentMapper {
    @Mapping(
        target = "universityId",
        expression = "java(student.getUniversity() != null ? student.getUniversity().getId() : null)"
    )
    public abstract StudentResponse toResponse(Student student);

    List<StudentResponse> toResponseList(List<Student> students) {
        return students.stream()
            .map(this::toResponse)
            .toList(); 
    }

    @Mapping(
        target = "passwordHash",
        source = "password",
        qualifiedByName = "hashPassword"
    )
    public abstract Student toEntity(CreateStudentRequest request);

    @AfterMapping
    protected void afterCreate(CreateStudentRequest request, @MappingTarget Student student) {
        student.setRoles(Set.of(UserRole.STUDENT));
    }

    // @Mapping(target = "name", source = "name", conditionQualifiedByName = "isDefined")
    public abstract void toEntity(UpdateStudentRequest request, @MappingTarget Student student);
}

