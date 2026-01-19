package com.researchhub.backend.university;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UniversityService {

    private final UniversityRepository universityRepository;

    // Create new university
    @Transactional
    public University createUniversity(String name, String country, String region) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required and cannot be empty");
        }
        if (country == null || country.isBlank()) {
            throw new IllegalArgumentException("Country is required and cannot be empty");
        }
        if (region == null || (!region.equals("Central Asia") && !region.equals("European Union"))) {
            throw new IllegalArgumentException("Region must be either \"Central Asia\" or \"European Union\"");
        }

        University university = new University();
        university.setName(name.trim());
        university.setCountry(country.trim());
        university.setRegion(region.trim());
        return universityRepository.save(university);
    }

    // Get all universities with optional filters
    public List<University> getUniversities(String search, String country, String region, int limit, int offset) {
        // Basic example using repository. For more complex filtering, use Specification or QueryDSL
        List<University> all = universityRepository.findAll();

        //review later (IMPORTANT LOGIC)
        return all.stream()
                .filter(u -> search == null || u.getName().toLowerCase().contains(search.toLowerCase())
                        || u.getCountry().toLowerCase().contains(search.toLowerCase()))
                .filter(u -> country == null || u.getCountry().equalsIgnoreCase(country))
                .filter(u -> region == null || u.getRegion().equalsIgnoreCase(region))
                .skip(offset)
                .limit(limit)
                .toList();
    }

    // Get university by ID
    public University getUniversityById(UUID id) {
        return universityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("University not found"));
    }
}
