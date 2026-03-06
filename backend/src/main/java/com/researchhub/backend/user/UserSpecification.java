package com.researchhub.backend.user;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    public static Specification<User> search(String search, String role) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Predicate searchPredicate = cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern)
                );
                predicate = cb.and(predicate, searchPredicate);
            }

            if (role != null && !role.isBlank()) {
                try {
                    UserRole userRole = UserRole.valueOf(role);
                    predicate = cb.and(predicate, cb.isMember(userRole, root.get("roles")));
                } catch (IllegalArgumentException ignored) {
                    // Invalid role - no filter
                }
            }

            return predicate;
        };
    }
}
