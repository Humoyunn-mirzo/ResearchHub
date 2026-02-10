package com.researchhub.backend.professor;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.*;
import com.researchhub.backend.university.University;

import java.util.UUID;

public class ProfessorSpecification {

    public static Specification<Professor> search(String search, UUID universityId, String fieldOfStudy) {
        return (root, query, cb) -> {

            Predicate predicate = cb.conjunction();

            // --- Join with University if filtering by universityId ---
            if (universityId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("university").get("id"), universityId));
            }

            // --- Filter by fieldOfStudy ---
            if (fieldOfStudy != null && !fieldOfStudy.isEmpty()) {
                predicate = cb.and(predicate, cb.equal(root.get("fieldOfStudy"), fieldOfStudy));
            }

            // --- Search by name, email, or fieldOfStudy ---
            if (search != null && !search.isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";

                // 'name' and 'email' are inherited from User
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("fieldOfStudy")), pattern)
                );

                predicate = cb.and(predicate, searchPredicate);
            }

            return predicate;
        };
    }
}

