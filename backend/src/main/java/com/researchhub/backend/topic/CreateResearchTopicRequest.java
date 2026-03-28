package com.researchhub.backend.topic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateResearchTopicRequest {
    @NotBlank
    @Size(min = 1, max = 200)
    private String name;
    private Integer sortOrder;
}
