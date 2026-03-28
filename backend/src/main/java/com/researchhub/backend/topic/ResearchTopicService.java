package com.researchhub.backend.topic;

import com.researchhub.backend.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResearchTopicService {

    private final ResearchTopicRepository researchTopicRepository;
    private final CurrentUserService currentUserService;

    public List<ResearchTopicResponse> findAllOrdered() {
        return researchTopicRepository.findAll().stream()
                .sorted(Comparator.comparingInt(ResearchTopic::getSortOrder).thenComparing(ResearchTopic::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ResearchTopicResponse create(CreateResearchTopicRequest request) {
        requireAdmin();
        String name = request.getName().trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Topic name cannot be empty");
        }
        if (researchTopicRepository.existsByName(name)) {
            throw new IllegalArgumentException("A topic with this name already exists");
        }
        ResearchTopic t = new ResearchTopic();
        t.setName(name);
        t.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        t = researchTopicRepository.save(t);
        return toResponse(t);
    }

    @Transactional
    public ResearchTopicResponse update(UUID id, UpdateResearchTopicRequest request) {
        requireAdmin();
        ResearchTopic t = researchTopicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Research topic not found"));

        String oldName = t.getName();

        if (request.getName() != null && !request.getName().isBlank()) {
            String newName = request.getName().trim();
            if (!newName.equals(oldName)) {
                if (researchTopicRepository.existsByName(newName)) {
                    throw new IllegalArgumentException("A topic with this name already exists");
                }
                long usage = researchTopicRepository.countUsageOnProjects(oldName);
                if (usage > 0) {
                    researchTopicRepository.renameOnProjects(oldName, newName);
                }
                t.setName(newName);
            }
        }
        if (request.getSortOrder() != null) {
            t.setSortOrder(request.getSortOrder());
        }
        t = researchTopicRepository.save(t);
        return toResponse(t);
    }

    @Transactional
    public void delete(UUID id) {
        requireAdmin();
        ResearchTopic t = researchTopicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Research topic not found"));
        long usage = researchTopicRepository.countUsageOnProjects(t.getName());
        if (usage > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This topic is used by one or more projects. Remove or replace tags on those projects first.");
        }
        researchTopicRepository.delete(t);
    }

    /**
     * Ensures every tag matches an existing research topic name (exact match).
     */
    public void assertValidProjectTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            throw new IllegalArgumentException("Select at least one research topic.");
        }
        List<String> normalized = tags.stream().map(String::trim).filter(s -> !s.isEmpty()).distinct().toList();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("Select at least one research topic.");
        }
        long found = researchTopicRepository.countByNameIn(normalized);
        if (found != normalized.size()) {
            throw new IllegalArgumentException(
                    "Every tag must be an approved research topic from the platform list.");
        }
    }

    private void requireAdmin() {
        if (!currentUserService.isDeveloperOrUniversityAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException("Admin only");
        }
    }

    private ResearchTopicResponse toResponse(ResearchTopic t) {
        return new ResearchTopicResponse(t.getId(), t.getName(), t.getSortOrder(), t.getCreatedAt());
    }
}
