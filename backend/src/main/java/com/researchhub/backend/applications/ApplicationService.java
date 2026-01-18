package com.researchhub.backend.applications;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    @Transactional
    public ApplicationCvResponse uploadCv(Long applicationId, UploadCvRequest request) {

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
