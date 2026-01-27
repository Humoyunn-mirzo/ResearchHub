package com.researchhub.backend.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    @Transactional
    public ApplicationCvResponse uploadCv(UUID applicationId, UploadCvRequest request) {

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Application not found"));

        // ⚠️ In production this should be cloud storage (S3, etc.)
        application.setCvUrl(request.getCvData());
        application.setUpdatedAt(OffsetDateTime.now());

        applicationRepository.save(application);

        return new ApplicationCvResponse(
                true,
                application.getCvUrl(),
                request.getFileName(),
                "CV uploaded successfully"
        );
    }
}
