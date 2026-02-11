package com.researchhub.backend.university;

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
public class UniversityService {

    private final UniversityRepository universityRepository;
    private final UniversityMapper universityMapper;

    public Page<UniversityResponse> getUniversities(Pageable pageable) {
        Page<University> page = universityRepository.findAll(pageable);

        List<UniversityResponse> content =
                universityMapper.toResponseList(page.getContent());

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public UniversityResponse getUniversityById(UUID id) {
        University university = universityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("University not found"));

        return universityMapper.toResponse(university);
    }

    @Transactional
    public UniversityResponse createUniversity(CreateUniversityRequest request) {

        if (universityRepository.existsByName(request.getName())) {
            throw new RuntimeException("University already exists");
        }

        University university = universityMapper.toEntity(request);
        university = universityRepository.save(university);

        return universityMapper.toResponse(university);
    }

    @Transactional
    public UniversityResponse updateUniversity(UUID id, UpdateUniversityRequest request) {

        University university = universityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("University not found"));

        universityMapper.toEntity(request, university);

        university = universityRepository.save(university);

        return universityMapper.toResponse(university);
    }

    @Transactional
    public void deleteUniversity(UUID id) {
        if (!universityRepository.existsById(id)) {
            throw new EntityNotFoundException("University not found");
        }

        universityRepository.deleteById(id);
    }
}
