package com.researchhub.backend.project;

import lombok.Data;

import java.util.List;
import java.util.Map;

import org.openapitools.jackson.nullable.JsonNullable;


@Data
public class UpdateProjectRequest {
    private JsonNullable<String> title = JsonNullable.undefined();
    private JsonNullable<String> description = JsonNullable.undefined();
    private JsonNullable<String> field = JsonNullable.undefined();
    private JsonNullable<String> regionFocus = JsonNullable.undefined();
    private JsonNullable<String> requirements = JsonNullable.undefined();
    private JsonNullable<Integer> maxStudents = JsonNullable.undefined();
    private JsonNullable<String> status = JsonNullable.undefined();
    private JsonNullable<List<Map<String, Object>>> interviewQuestions = JsonNullable.undefined();
    private JsonNullable<List<String>> tags = JsonNullable.undefined();
}
