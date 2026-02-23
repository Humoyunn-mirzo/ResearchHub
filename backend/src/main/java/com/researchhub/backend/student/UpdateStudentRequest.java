package com.researchhub.backend.student;

import java.util.UUID;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.Data;


@Data
public class UpdateStudentRequest {
    private JsonNullable<String> name = JsonNullable.undefined();
    private JsonNullable<UUID> universityId = JsonNullable.undefined();
    private JsonNullable<String> fieldOfInterest = JsonNullable.undefined();
    private JsonNullable<String> bio = JsonNullable.undefined();
}
