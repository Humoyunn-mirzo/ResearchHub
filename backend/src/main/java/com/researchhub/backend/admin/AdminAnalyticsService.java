package com.researchhub.backend.admin;

import com.researchhub.backend.application.ApplicationRepository;
import com.researchhub.backend.application.ApplicationStatus;
import com.researchhub.backend.project.ProjectRepository;
import com.researchhub.backend.university.UniversityRepository;
import com.researchhub.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final UniversityRepository universityRepository;
    private final ApplicationRepository applicationRepository;

    public AdminAnalyticsService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            UniversityRepository universityRepository,
            ApplicationRepository applicationRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.universityRepository = universityRepository;
        this.applicationRepository = applicationRepository;
    }

    public AdminAnalyticsResponse getAnalytics() {
        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("DEVELOPER", userRepository.countByRole("DEVELOPER"));
        usersByRole.put("UNIVERSITY_ADMIN", userRepository.countByRole("UNIVERSITY_ADMIN"));
        usersByRole.put("PROFESSOR", userRepository.countByRole("PROFESSOR"));
        usersByRole.put("STUDENT", userRepository.countByRole("STUDENT"));

        long totalUsers = userRepository.count();

        long openProjects = projectRepository.countByStatus("OPEN");
        long closedProjects = projectRepository.countByStatus("CLOSED");
        long totalProjects = projectRepository.count();

        long pendingApplications = applicationRepository.countByStatus(ApplicationStatus.PENDING);
        long acceptedApplications = applicationRepository.countByStatus(ApplicationStatus.ACCEPTED);
        long rejectedApplications = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        long totalApplications = applicationRepository.count();

        return new AdminAnalyticsResponse(
                totalUsers,
                usersByRole,
                totalProjects,
                openProjects,
                closedProjects,
                universityRepository.count(),
                totalApplications,
                pendingApplications,
                acceptedApplications,
                rejectedApplications
        );
    }
}
