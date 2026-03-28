package com.researchhub.backend.topic;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateResearchTopicRequest {
    @Size(min = 1, max = 200)
    private String name;
    private Integer sortOrder;
}
