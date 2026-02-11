package com.researchhub.backend.application;

import com.researchhub.backend.project.Project;
import com.researchhub.backend.project.ProjectRepository;
import com.researchhub.backend.student.Student;
import com.researchhub.backend.student.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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

    // ========== Basic CRUD ==========

    public Page<ApplicationResponse> getApplications(Pageable pageable) {
        Page<Application> page = applicationRepository.findAll(pageable);
        List<ApplicationResponse> content = applicationMapper.toResponseList(page.getContent());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public ApplicationResponse getApplicationById(UUID id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with id: " + id));
        return applicationMapper.toResponse(application);
    }

    @Transactional
    public ApplicationResponse createApplication(CreateApplicationRequest request) {
        // 1. Verify student exists
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + request.getStudentId()));

        // 2. Verify project exists
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + request.getProjectId()));

        // 3. Prevent duplicate application (optional but recommended)
        if (applicationRepository.existsByStudentIdAndProjectId(request.getStudentId(), request.getProjectId())) {
            throw new IllegalStateException("Student has already applied to this project");
        }

        // 4. Map request to entity and set relations
        Application application = applicationMapper.toEntity(request);
        application.setStudent(student);
        application.setProject(project);

        // 5. Save
        application = applicationRepository.save(application);

        return applicationMapper.toResponse(application);
    }

    @Transactional
    public ApplicationResponse updateApplication(UUID id, UpdateApplicationRequest request) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with id: " + id));

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
            throw new EntityNotFoundException("Student not found with id: " + studentId);
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
            throw new EntityNotFoundException("Project not found with id: " + projectId);
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