package com.researchhub.backend.application;

import com.researchhub.backend.application.exception.ApplicationAlreadyExistsException;
import com.researchhub.backend.application.exception.ApplicationNotFoundException;
import com.researchhub.backend.project.Project;
import com.researchhub.backend.project.ProjectRepository;
import com.researchhub.backend.project.exception.ProjectNotFoundException;
import com.researchhub.backend.student.Student;
import com.researchhub.backend.student.StudentRepository;
import com.researchhub.backend.student.exception.StudentNotFoundException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;
    private final ApplicationMapper applicationMapper;

    public Page<ApplicationResponse> getApplications(Pageable pageable) {
        Page<Application> page = applicationRepository.findAll(pageable);
        List<ApplicationResponse> content = applicationMapper.toResponseList(page.getContent());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public ApplicationResponse getApplicationById(UUID id) {
        Application application = applicationRepository.findById(id)
            .orElseThrow(() -> new ApplicationNotFoundException(id));
        return applicationMapper.toResponse(application);
    }

    @Transactional
    public ApplicationResponse createApplication(CreateApplicationRequest request) {
        String email = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new StudentNotFoundException(email));

        Project project = projectRepository.findById(request.getProjectId())
            .orElseThrow(() -> new ProjectNotFoundException(request.getProjectId()));

        if (applicationRepository.existsByStudentIdAndProjectId(student.getId(), project.getId())) {
            throw new ApplicationAlreadyExistsException(student.getId(), project.getId());
        }

        Application application = applicationMapper.toEntity(request);
        application.setStudent(student);
        application.setProject(project);
        application.setStatus(ApplicationStatus.PENDING);

        application = applicationRepository.save(application);

        return applicationMapper.toResponse(application);
    }

    @Transactional
    public ApplicationResponse updateApplication(UUID id, UpdateApplicationRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ApplicationNotFoundException(id));

        // Only status can be updated (others are immutable)
        applicationMapper.toEntity(request, application);

        application = applicationRepository.save(application);
        return applicationMapper.toResponse(application);
    }

    @Transactional
    public void deleteApplication(UUID id) {
        if (!applicationRepository.existsById(id)) {
            throw new EntityNotFoundException("Application not found with id: " + id);
        }
        applicationRepository.deleteById(id);
    }

    // ========== Custom queries ==========

    public Page<ApplicationResponse> getApplicationsByStudent(UUID studentId, ApplicationStatus status, Pageable pageable) {
        // Verify student exists (optional, but good practice)
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException(studentId);
        }

        Page<Application> page;
        if (status == null) {
            page = applicationRepository.findByStudentId(studentId, pageable);
        } else {
            page = applicationRepository.findByStudentIdAndStatus(studentId, status, pageable);
        }

        List<ApplicationResponse> content = applicationMapper.toResponseList(page.getContent());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public Page<ApplicationResponse> getApplicationsByProject(UUID projectId, ApplicationStatus status, Pageable pageable) {
        if (!projectRepository.existsById(projectId)) {
            throw new ProjectNotFoundException(projectId);
        }

        Page<Application> page;
        if (status == null) {
            page = applicationRepository.findByProjectId(projectId, pageable);
        } else {
            page = applicationRepository.findByProjectIdAndStatus(projectId, status, pageable);
        }

        List<ApplicationResponse> content = applicationMapper.toResponseList(page.getContent());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }
}
