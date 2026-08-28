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
    private JsonNullable<String> title = JsonNullable.undefined();
    private JsonNullable<String> department = JsonNullable.undefined();
    private JsonNullable<String> officeLocation = JsonNullable.undefined();
    private JsonNullable<String> phone = JsonNullable.undefined();
    private JsonNullable<String> websiteUrl = JsonNullable.undefined();
    private JsonNullable<String> researchInterests = JsonNullable.undefined();
}
