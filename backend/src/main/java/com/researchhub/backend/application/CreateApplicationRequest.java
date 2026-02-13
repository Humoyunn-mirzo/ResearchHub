package com.researchhub.backend.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateApplicationRequest {
    @NotNull
    private UUID projectId;

    @NotBlank
    @Size(min = 50, max = 1000)
    private String motivation;
}
