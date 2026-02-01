package com.researchhub.backend.application;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UploadCvRequest {
    @NotBlank(message = "cvData is required")
    private String cvData;

    @NotBlank(message = "fileName is required")
    private String fileName;
}
