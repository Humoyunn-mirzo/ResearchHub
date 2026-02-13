package com.researchhub.backend.project;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProjectRequest {
    @Size(min = 5, max = 200)
    private String title;

    @Size(min = 20, max = 2000)
    private String description;

    @Min(1)
    @Max(20)
    private Integer slots;

    @Size(min = 1, max = 10)
    private List<@Size(max = 100) String> tags;
}
