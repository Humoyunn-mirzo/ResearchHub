package com.researchhub.backend.security;

import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.student.Student;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserRepository;
import com.researchhub.backend.user.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("User not found"));
    }

    public boolean hasRole(UserRole role) {
        User user = getCurrentUser();
        Set<UserRole> roles = user.getRoles();
        return roles != null && roles.contains(role);
    }

    public boolean isDeveloperOrUniversityAdmin() {
        return hasRole(UserRole.DEVELOPER) || hasRole(UserRole.UNIVERSITY_ADMIN);
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public Student getCurrentStudentOrNull() {
        User user = getCurrentUser();
        return user instanceof Student s ? s : null;
    }

    public Professor getCurrentProfessorOrNull() {
        User user = getCurrentUser();
        return user instanceof Professor p ? p : null;
    }
}
