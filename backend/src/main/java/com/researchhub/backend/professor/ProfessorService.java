package com.researchhub.backend.professor;

import com.researchhub.backend.professor.exception.ProfessorAlreadyExistsException;
import com.researchhub.backend.professor.exception.ProfessorNotFoundException;
import com.researchhub.backend.university.University;
import com.researchhub.backend.university.UniversityRepository;
import com.researchhub.backend.university.exception.UniversityNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfessorService {

    private static final long MAX_CV_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final List<String> ALLOWED_CV_EXTENSIONS = List.of(".pdf", ".doc", ".docx");

    private final ProfessorRepository professorRepository;
    private final UniversityRepository universityRepository;
    private final ProfessorMapper professorMapper;
    private final PasswordEncoder passwordEncoder;

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
            .orElseThrow(() -> new ProfessorNotFoundException(id));
        return professorMapper.toResponse(professor);
    }

    @Transactional
    public ProfessorResponse createProfessor(CreateProfessorRequest request) {
        if (professorRepository.existsByEmail(request.getEmail())) {
            throw new ProfessorAlreadyExistsException(request.getEmail());
        }

        Professor professor = professorMapper.toEntity(request);

        University university = null;
        if (request.getUniversityId() != null) {
            university = universityRepository.findById(request.getUniversityId())
            .orElseThrow(() -> new UniversityNotFoundException(request.getUniversityId()));
        }

        professor.setUniversity(university);

        professor = professorRepository.save(professor);

        return professorMapper.toResponse(professor);
    }

    @Transactional
    public ProfessorResponse updateProfessor(UUID id, UpdateProfessorRequest request) {
        Professor professor = professorRepository.findById(id)
            .orElseThrow(() -> new ProfessorNotFoundException(id));

        professorMapper.toEntity(request, professor);

        professor = professorRepository.save(professor);

        return professorMapper.toResponse(professor);
    }

    @Transactional
    public void deleteProfessor(UUID id) {
        if (!professorRepository.existsById(id)) {
            throw new ProfessorNotFoundException(id);
        }

        professorRepository.deleteById(id);
    }

    @Transactional
    public ProfessorResponse registerProfessorWithCv(
            String name,
            String email,
            String password,
            String fieldOfStudy,
            UUID universityId,
            MultipartFile cvFile
    ) {
        if (professorRepository.existsByEmail(email)) {
            throw new ProfessorAlreadyExistsException(email);
        }
        if (cvFile == null || cvFile.isEmpty()) {
            throw new IllegalArgumentException("CV file is required for professor registration");
        }
        String filename = cvFile.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("CV file must have a name");
        }
        String ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_CV_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("CV must be PDF, DOC, or DOCX format");
        }
        if (cvFile.getSize() > MAX_CV_SIZE) {
            throw new IllegalArgumentException("CV file must be under 10 MB");
        }

        Professor professor = new Professor();
        professor.setEmail(email);
        professor.setPasswordHash(passwordEncoder.encode(password));
        professor.setName(name != null && !name.isBlank() ? name : email);
        professor.setRoles(java.util.Set.of(com.researchhub.backend.user.UserRole.PROFESSOR));
        professor.setFieldOfStudy(fieldOfStudy != null && !fieldOfStudy.isBlank() ? fieldOfStudy : "General");
        professor.setRankingScore(0);
        professor.setTotalProjects(0);
        professor.setStudentsSupervised(0);
        professor.setStatus(ProfessorStatus.PENDING);
        try {
            professor.setCvFile(cvFile.getBytes());
            professor.setCvFileName(filename);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to read CV file", e);
        }

        if (universityId != null) {
            University university = universityRepository.findById(universityId)
                    .orElseThrow(() -> new UniversityNotFoundException(universityId));
            professor.setUniversity(university);
        }

        professor = professorRepository.save(professor);
        return professorMapper.toResponse(professor);
    }

    public Page<ProfessorResponse> getPendingProfessors(Pageable pageable) {
        Page<Professor> page = professorRepository.findByStatus(ProfessorStatus.PENDING, pageable);
        return new PageImpl<>(professorMapper.toResponseList(page.getContent()), pageable, page.getTotalElements());
    }

    @Transactional
    public ProfessorResponse approveProfessor(UUID id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new ProfessorNotFoundException(id));
        professor.setStatus(ProfessorStatus.CONFIRMED);
        professor = professorRepository.save(professor);
        return professorMapper.toResponse(professor);
    }

    public byte[] getProfessorCv(UUID id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new ProfessorNotFoundException(id));
        if (professor.getCvFile() == null) {
            throw new ProfessorNotFoundException(id);
        }
        return professor.getCvFile();
    }

    public record CvDownload(byte[] data, String filename) {}

    public CvDownload getProfessorCvWithFilename(UUID id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new ProfessorNotFoundException(id));
        if (professor.getCvFile() == null) {
            throw new ProfessorNotFoundException(id);
        }
        String fn = professor.getCvFileName() != null ? professor.getCvFileName() : "professor_cv.pdf";
        return new CvDownload(professor.getCvFile(), fn);
    }
}
