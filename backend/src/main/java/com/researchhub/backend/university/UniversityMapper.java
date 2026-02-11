package com.researchhub.backend.university;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UniversityMapper {

    UniversityResponse toResponse(University university);

    List<UniversityResponse> toResponseList(List<University> universities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rankingScore", ignore = true)
    @Mapping(target = "totalProjects", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    University toEntity(CreateUniversityRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rankingScore", ignore = true)
    @Mapping(target = "totalProjects", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void toEntity(UpdateUniversityRequest request, @MappingTarget University university);
}
