package com.researchhub.backend.rankings;

import com.researchhub.backend.application.ApplicationRepository;
import com.researchhub.backend.application.ApplicationStatus;
import com.researchhub.backend.project.ProjectRepository;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RankingsService {

    private final ProjectRepository projectRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public RankingsService(ProjectRepository projectRepository,
                          ApplicationRepository applicationRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<RankingEntry> getTopStudents() {
        var apps = applicationRepository.findAll();
        var byStudent = apps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED && a.getStudent() != null)
                .collect(Collectors.groupingBy(a -> a.getStudent().getId(), Collectors.counting()));
        var sorted = byStudent.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(10)
                .toList();

        List<RankingEntry> result = new ArrayList<>();
        int rank = 1;
        for (var e : sorted) {
            User user = userRepository.findById((UUID) e.getKey()).orElse(null);
            String name = user != null ? (user.getName() != null ? user.getName() : user.getEmail()) : "Unknown";
            result.add(new RankingEntry(rank++, name, null, "Accepted: " + e.getValue(), null));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<RankingEntry> getTopProfessors() {
        var projects = projectRepository.findAll();
        var byProfessor = projects.stream()
                .filter(p -> p.getProfessor() != null)
                .collect(Collectors.groupingBy(p -> p.getProfessor().getId(), Collectors.counting()));
        var sorted = byProfessor.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(10)
                .toList();

        List<RankingEntry> result = new ArrayList<>();
        int rank = 1;
        for (var e : sorted) {
            User user = userRepository.findById((UUID) e.getKey()).orElse(null);
            String name = user != null ? (user.getName() != null ? user.getName() : user.getEmail()) : "Unknown";
            result.add(new RankingEntry(rank++, name, null, "Projects: " + e.getValue(), null));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<RankingEntry> getTopProjects() {
        var apps = applicationRepository.findAll();
        var byProject = apps.stream()
                .filter(a -> a.getProject() != null)
                .collect(Collectors.groupingBy(a -> a.getProject().getId(), Collectors.counting()));
        var sorted = byProject.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(10)
                .toList();

        List<RankingEntry> result = new ArrayList<>();
        int rank = 1;
        for (var e : sorted) {
            var project = projectRepository.findById((UUID) e.getKey());
            if (project.isEmpty()) continue;
            var p = project.get();
            long appCount = e.getValue();
            result.add(new RankingEntry(rank++, p.getTitle(),
                    "Applicants: " + appCount,
                    "Openings: " + p.getMaxStudents(),
                    "/projects/" + p.getId()));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<RankingEntry> getTopUniversities() {
        return List.of(
                new RankingEntry(1, "Central Asia University", null, "Active Projects: 0", null),
                new RankingEntry(2, "EU Tech Institute", null, "Active Projects: 0", null),
                new RankingEntry(3, "Steppe State University", null, "Active Projects: 0", null)
        );
    }
}
