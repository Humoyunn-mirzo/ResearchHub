package com.researchhub.backend.application;

import com.researchhub.backend.application.exception.ApplicationAlreadyExistsException;
import com.researchhub.backend.application.exception.ApplicationNotFoundException;
import com.researchhub.backend.project.Project;
import com.researchhub.backend.project.ProjectRepository;
import com.researchhub.backend.project.exception.ProjectNotFoundException;
import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.security.CurrentUserService;
import com.researchhub.backend.student.Student;
import com.researchhub.backend.student.StudentRepository;
import com.researchhub.backend.student.exception.StudentNotFoundException;
import com.researchhub.backend.user.User;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
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
    private final CurrentUserService currentUserService;

    public Page<ApplicationResponse> getApplications(Pageable pageable) {
        if (!currentUserService.isDeveloperOrUniversityAdmin()) {
            throw new AccessDeniedException("Only admins can list all applications");
        }
        Page<Application> page = applicationRepository.findAll(pageable);
        List<ApplicationResponse> content = applicationMapper.toResponseList(page.getContent());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public ApplicationResponse getApplicationById(UUID id) {
        Application application = applicationRepository.findById(id)
            .orElseThrow(() -> new ApplicationNotFoundException(id));
        ensureCanViewApplication(application);
        return applicationMapper.toResponse(application);
    }

    @Transactional
    public ApplicationResponse createApplication(CreateApplicationRequest request) {
        Student student = currentUserService.getCurrentStudentOrNull();
        if (student == null) {
            throw new AccessDeniedException("Only students can create applications");
        }

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

        Student currentStudent = currentUserService.getCurrentStudentOrNull();
        Professor currentProfessor = currentUserService.getCurrentProfessorOrNull();

        boolean isProjectProfessor = currentProfessor != null && application.getProject().getProfessor() != null
                && application.getProject().getProfessor().getId().equals(currentProfessor.getId());

        if (!isProjectProfessor && !currentUserService.isDeveloperOrUniversityAdmin()) {
            throw new AccessDeniedException("Only the project professor or admin can update application status");
        }

        if (request.getStatus() != null && request.getStatus().isPresent()) {
            application.setStatus(request.getStatus().get());
        }
        applicationMapper.toEntity(request, application);

        application = applicationRepository.save(application);
        return applicationMapper.toResponse(application);
    }

    @Transactional
    public void deleteApplication(UUID id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ApplicationNotFoundException(id));

        Student currentStudent = currentUserService.getCurrentStudentOrNull();
        if (currentStudent == null || !application.getStudent().getId().equals(currentStudent.getId())) {
            throw new AccessDeniedException("Only the applicant can withdraw an application");
        }

        applicationRepository.deleteById(id);
    }

    // ========== Custom queries ==========

    public Page<ApplicationResponse> getApplicationsByStudent(UUID studentId, ApplicationStatus status, Pageable pageable) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException(studentId);
        }

        Student currentStudent = currentUserService.getCurrentStudentOrNull();
        boolean isOwn = currentStudent != null && studentId.equals(currentStudent.getId());
        if (!isOwn && !currentUserService.isDeveloperOrUniversityAdmin()) {
            throw new AccessDeniedException("You can only view your own applications");
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
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        Professor currentProfessor = currentUserService.getCurrentProfessorOrNull();
        boolean isOwnProject = currentProfessor != null && project.getProfessor() != null
                && project.getProfessor().getId().equals(currentProfessor.getId());
        if (!isOwnProject && !currentUserService.isDeveloperOrUniversityAdmin()) {
            throw new AccessDeniedException("You can only view applications for your own projects");
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

    public Page<ApplicationResponse> getApplicationsForProfessorProjects(Pageable pageable) {
        Professor professor = currentUserService.getCurrentProfessorOrNull();
        if (professor == null) {
            throw new AccessDeniedException("Only professors can view applications for their projects");
        }

        List<Project> myProjects = projectRepository.findByProfessorId(professor.getId());
        if (myProjects.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<Application> allApplications = myProjects.stream()
                .flatMap(p -> applicationRepository.findByProjectId(p.getId(), Pageable.unpaged()).getContent().stream())
                .sorted((a, b) -> b.getAppliedAt().compareTo(a.getAppliedAt()))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allApplications.size());
        List<Application> pageContent = start < allApplications.size() ? allApplications.subList(start, end) : List.of();

        return new PageImpl<>(applicationMapper.toResponseList(pageContent), pageable, allApplications.size());
    }

    private void ensureCanViewApplication(Application application) {
        User currentUser = currentUserService.getCurrentUser();
        boolean isStudentOwner = currentUser instanceof Student s && application.getStudent().getId().equals(s.getId());
        boolean isProjectProfessor = currentUser instanceof Professor p && application.getProject().getProfessor() != null
                && application.getProject().getProfessor().getId().equals(p.getId());
        if (!isStudentOwner && !isProjectProfessor && !currentUserService.isDeveloperOrUniversityAdmin()) {
            throw new AccessDeniedException("You do not have permission to view this application");
        }
    }
}
