package com.researchhub.backend.application;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.NotBlank;

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
