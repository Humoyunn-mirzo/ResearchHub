package com.researchhub.backend.professor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.researchhub.backend.user.UserRole;

@Mapper(componentModel = "spring")
public abstract class ProfessorMapper {
    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Mapping(
        target = "universityId",
        expression = "java(professor.getUniversity() != null ? professor.getUniversity().getId() : null)"
    )
    public abstract ProfessorResponse toResponse(Professor professor);

    List<ProfessorResponse> toResponseList(List<Professor> professors) {
        return professors.stream()
            .map(this::toResponse)
            .toList(); 
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "university", ignore = true)
    @Mapping(target = "rankingScore", ignore = true)
    @Mapping(target = "totalProjects", ignore = true)
    @Mapping(target = "studentsSupervised", ignore = true)
    @Mapping(target = "acceptanceRate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(
        target = "passwordHash",
        source = "password",
        qualifiedByName = "hashPassword"
    )
    public abstract Professor toEntity(CreateProfessorRequest request);

    @AfterMapping
    protected void afterCreate(CreateProfessorRequest request, @MappingTarget Professor professor) {
        professor.setRoles(Set.of(UserRole.PROFESSOR));
        professor.setCreatedAt(OffsetDateTime.now());
        professor.setUpdatedAt(OffsetDateTime.now());
    }


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "university", ignore = true)
    @Mapping(target = "rankingScore", ignore = true)
    @Mapping(target = "totalProjects", ignore = true)
    @Mapping(target = "studentsSupervised", ignore = true)
    @Mapping(target = "acceptanceRate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void toEntity(UpdateProfessorRequest request, @MappingTarget Professor professor);


    @Named("hashPassword")
    protected String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }
}
