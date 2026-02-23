package com.researchhub.backend.professor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.researchhub.backend.common.GlobalMapperConfig;
import com.researchhub.backend.user.UserRole;

@Mapper(config = GlobalMapperConfig.class)
public abstract class ProfessorMapper {
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

    @Mapping(
        target = "passwordHash",
        source = "password",
        qualifiedByName = "hashPassword"
    )
    public abstract Professor toEntity(CreateProfessorRequest request);

    @AfterMapping
    protected void afterCreate(CreateProfessorRequest request, @MappingTarget Professor professor) {
        professor.setRoles(Set.of(UserRole.PROFESSOR));
    }


    public abstract void toEntity(UpdateProfessorRequest request, @MappingTarget Professor professor);
}
