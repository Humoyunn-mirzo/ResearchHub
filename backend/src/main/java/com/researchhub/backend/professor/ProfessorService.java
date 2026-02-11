package com.researchhub.backend.professor;

import com.researchhub.backend.university.University;
import com.researchhub.backend.university.UniversityRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfessorService {

    private final ProfessorRepository professorRepository;
	private final UniversityRepository universityRepository;
    private final ProfessorMapper professorMapper;

    public Page<ProfessorResponse> getProfessors(
        Pageable pageable,
        String search,
        UUID universityId,
        String fieldOfStudy
    ) {
        Page<Professor> page = professorRepository.findAll(
            ProfessorSpecification.search(search, universityId, fieldOfStudy),
            pageable
        );

        List<ProfessorResponse> content = professorMapper.toResponseList(page.getContent());

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public ProfessorResponse getProfessorById(UUID id) {
        Professor professor = professorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Professor not found"));
        return professorMapper.toResponse(professor);
    }

    @Transactional
    public ProfessorResponse createProfessor(CreateProfessorRequest request) {
        if (professorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Professor professor = professorMapper.toEntity(request);

        University university = null;
        if (request.getUniversityId() != null) {
            university = universityRepository.findById(request.getUniversityId())
            .orElseThrow(() -> new EntityNotFoundException(
                "University not found: " + request.getUniversityId()
            ));
        }

        professor.setUniversity(university);

        professor = professorRepository.save(professor);

        return professorMapper.toResponse(professor);
    }

    @Transactional
    public ProfessorResponse updateProfessor(UUID id, UpdateProfessorRequest request) {
        Professor professor = professorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Professor not found"));

        professorMapper.toEntity(request, professor);

        professor = professorRepository.save(professor);

        return professorMapper.toResponse(professor);
    }

    @Transactional
    public void deleteProfessor(UUID id) {
        if (!professorRepository.existsById(id)) {
            throw new EntityNotFoundException("Professor not found");
        }

        professorRepository.deleteById(id);
    }
}
