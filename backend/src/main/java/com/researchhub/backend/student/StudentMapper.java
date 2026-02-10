package com.researchhub.backend.student;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.researchhub.backend.user.UserRole;

@Mapper(componentModel = "spring")
public abstract class StudentMapper {
    @Autowired
    protected PasswordEncoder passwordEncoder;

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

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "university", ignore = true)
    @Mapping(target = "totalApplications", ignore = true)
    @Mapping(target = "acceptedProjects", ignore = true)
    @Mapping(
        target = "passwordHash",
        source = "password",
        qualifiedByName = "hashPassword"
    )
    public abstract Student toEntity(CreateStudentRequest request);

    @AfterMapping
    protected void afterCreate(CreateStudentRequest request, @MappingTarget Student student) {
        student.setRoles(Set.of(UserRole.STUDENT));
        student.setCreatedAt(OffsetDateTime.now());
        student.setUpdatedAt(OffsetDateTime.now());
    }


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "university", ignore = true)
    @Mapping(target = "totalApplications", ignore = true)
    @Mapping(target = "acceptedProjects", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    public abstract void toEntity(UpdateStudentRequest request, @MappingTarget Student student);

    @AfterMapping
    protected void afterUpdate(CreateStudentRequest request, @MappingTarget Student student) {
        student.setUpdatedAt(OffsetDateTime.now());
    }


    @Named("hashPassword")
    protected String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }
}

