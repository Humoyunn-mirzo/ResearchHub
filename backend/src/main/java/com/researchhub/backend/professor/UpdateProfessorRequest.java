package com.researchhub.backend.professor;

import java.util.UUID;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.Data;

@Data
public class UpdateProfessorRequest {
    private JsonNullable<String> name = JsonNullable.undefined();
    private JsonNullable<String> fieldOfStudy = JsonNullable.undefined();
    private JsonNullable<UUID> universityId = JsonNullable.undefined();
    private JsonNullable<String> bio = JsonNullable.undefined();
}
