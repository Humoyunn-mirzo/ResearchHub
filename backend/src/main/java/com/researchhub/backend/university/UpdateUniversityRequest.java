package com.researchhub.backend.university;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.Data;

@Data
public class UpdateUniversityRequest {
    private JsonNullable<String> name = JsonNullable.undefined();
    private JsonNullable<String> country = JsonNullable.undefined();
    private JsonNullable<String> region = JsonNullable.undefined();
}
