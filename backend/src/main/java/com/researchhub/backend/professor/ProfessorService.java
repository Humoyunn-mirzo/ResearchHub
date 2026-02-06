package com.researchhub.backend.professor;

import com.researchhub.backend.application.ResourceNotFoundException;
import com.researchhub.backend.project.Project;
import com.researchhub.backend.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final ProjectRepository projectRepository;

    public Page<Professor> getProfessors(
        Pageable pageable,
        String search,
        UUID universityId,
        String fieldOfStudy
    ) {
        return professorRepository.findFiltered(
            pageable,
            search,
            universityId,
            fieldOfStudy
        );
    }

    public Professor createProfessor(CreateProfessorRequest request) {
        Professor professor = new Professor();
        professor.setName(request.name().trim());
        professor.setEmail(request.email().trim());  ///Look into lowercasing the domain of the email later
        professor.setFieldOfStudy(request.fieldOfStudy().trim());
        professor.setBio(request.bio());
        professor.setAcceptanceRate(request.acceptanceRate());
        professor.setRankingScore(0);
        professor.setTotalProjects(0);
        professor.setStudentsSupervised(0);
        professor.setCreatedAt(OffsetDateTime.now());
        professor.setUpdatedAt(OffsetDateTime.now());

        return professorRepository.save(professor);
    }

    public ProfessorWithProjectsResponse getProfessorWithProjects(UUID id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professor not found"));

        List<Project> projects =
                projectRepository.findByProfessorId(id);

        return new ProfessorWithProjectsResponse(professor, projects);
    }
}
