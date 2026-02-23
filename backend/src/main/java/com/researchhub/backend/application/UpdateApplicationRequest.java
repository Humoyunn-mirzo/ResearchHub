package com.researchhub.backend.application;

import org.openapitools.jackson.nullable.JsonNullable;

import lombok.Data;

@Data
public class UpdateApplicationRequest {
    private JsonNullable<ApplicationStatus> status = JsonNullable.undefined();
    private JsonNullable<String> cvFile = JsonNullable.undefined();
}
