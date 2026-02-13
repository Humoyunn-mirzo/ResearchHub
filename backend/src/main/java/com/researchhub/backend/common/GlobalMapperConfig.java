package com.researchhub.backend.common;

import org.mapstruct.CollectionMappingStrategy;
import org.mapstruct.MapperConfig;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@MapperConfig(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    uses = { JsonNullableMapper.class, PasswordMapper.class },
    // Optional: useful for updates to ensure collections are updated properly
    collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface GlobalMapperConfig {
}
