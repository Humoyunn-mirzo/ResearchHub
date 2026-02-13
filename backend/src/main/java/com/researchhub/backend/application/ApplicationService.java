package com.researchhub.backend.application;

import com.researchhub.backend.project.Project;
import com.researchhub.backend.project.ProjectRepository;
import com.researchhub.backend.project.ProjectStatus;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserRepository;
import com.researchhub.backend.user.UserRole;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ProjectRepository projectRepository,
                              UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ApplicationsPage list(UUID projectId, UUID studentId, ApplicationStatus status, int page, int limit) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, limit)),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = applicationRepository.findFiltered(projectId, studentId, status, pageable);
        List<ApplicationDto> dtos = result.getContent().stream()
                .map(this::toDto)
                .toList();
        return new ApplicationsPage(dtos, (int) result.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public ApplicationDto getById(UUID id, UUID currentUserId) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        Project project = projectRepository.findById(app.getProjectId()).orElse(null);
        boolean isOwner = app.getStudentId().equals(currentUserId);
        boolean isProfessor = project != null && project.getProfessorId().equals(currentUserId);
        if (!isOwner && !isProfessor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return toDtoWithRelations(app);
    }

    @Transactional
    public ApplicationDto create(UUID userId, CreateApplicationRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (!user.getRoles().contains(UserRole.STUDENT)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can apply to projects");
        }

        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project is not open for applications");
        }

        if (applicationRepository.existsByProjectIdAndStudentId(req.getProjectId(), userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied to this project");
        }

        Application app = new Application();
        app.setProjectId(req.getProjectId());
        app.setStudentId(userId);
        app.setStatus(ApplicationStatus.PENDING);
        app.setMotivation(req.getMotivation());
        app = applicationRepository.save(app);
        return toDtoWithRelations(app);
    }

    @Transactional
    public ApplicationDto updateStatus(UUID id, UUID userId, ApplicationStatus status) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        Project project = projectRepository.findById(app.getProjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.getProfessorId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the project owner can update application status");
        }

        if (status != ApplicationStatus.ACCEPTED && status != ApplicationStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be ACCEPTED or REJECTED");
        }

        app.setStatus(status);
        app = applicationRepository.save(app);
        return toDtoWithRelations(app);
    }

    @Transactional
    public void withdraw(UUID id, UUID userId) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if (!app.getStudentId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the applicant can withdraw");
        }
        applicationRepository.delete(app);
    }

    private ApplicationDto toDto(Application a) {
        ApplicationDto dto = new ApplicationDto();
        dto.setId(a.getId());
        dto.setProjectId(a.getProjectId());
        dto.setStudentId(a.getStudentId());
        dto.setStatus(a.getStatus());
        dto.setMotivation(a.getMotivation());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }

    private ApplicationDto toDtoWithRelations(Application a) {
        ApplicationDto dto = toDto(a);
        if (a.getStudent() != null) {
            dto.setStudent(ApplicationDto.toStudentInfo(a.getStudent()));
        } else {
            userRepository.findById(a.getStudentId()).ifPresent(u -> dto.setStudent(ApplicationDto.toStudentInfo(u)));
        }
        if (a.getProject() != null) {
            dto.setProject(ApplicationDto.toProjectInfo(a.getProject()));
        } else {
            projectRepository.findById(a.getProjectId()).ifPresent(p -> dto.setProject(ApplicationDto.toProjectInfo(p)));
        }
        return dto;
    }

    @lombok.Data
    public static class ApplicationsPage {
        private final List<ApplicationDto> data;
        private final int total;
        private final int page;
        private final int limit;
    }
}
