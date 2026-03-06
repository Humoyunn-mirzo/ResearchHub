package com.researchhub.backend.user;

import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.professor.ProfessorRepository;
import com.researchhub.backend.student.Student;
import com.researchhub.backend.student.StudentRepository;
import com.researchhub.backend.university.University;

import jakarta.transaction.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProfessorRepository professorRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       ProfessorRepository professorRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.professorRepository = professorRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserResponse> getUsers(Pageable pageable, String search, String role) {
        Specification<User> spec = UserSpecification.search(search, role);
        return userRepository.findAll(spec, pageable).map(this::toResponse);
    }

    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new com.researchhub.backend.user.exception.UserNotFoundException(id));
        return toResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        return registerUserAndReturn(request.getEmail(), request.getPassword(),
            request.getRole() != null ? request.getRole() : "STUDENT",
            request.getName() != null ? request.getName() : request.getEmail());
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new com.researchhub.backend.user.exception.UserNotFoundException(id));
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getRole() != null && !request.getRole().isBlank() && !(user instanceof Professor) && !(user instanceof Student)) {
            try {
                UserRole userRole = UserRole.valueOf(request.getRole());
                if (userRole != UserRole.DEVELOPER) {
                    user.setRoles(Set.of(userRole));
                }
            } catch (IllegalArgumentException ignored) {
            }
        }
        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new com.researchhub.backend.user.exception.UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public void resetPassword(UUID id, String newPassword) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new com.researchhub.backend.user.exception.UserNotFoundException(id));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        String role = (user.getRoles() != null && !user.getRoles().isEmpty())
            ? user.getRoles().iterator().next().name()
            : "STUDENT";
        UUID universityId = null;
        if (user instanceof Professor prof) {
            University u = prof.getUniversity();
            universityId = u != null ? u.getId() : null;
        } else if (user instanceof Student stud) {
            University u = stud.getUniversity();
            universityId = u != null ? u.getId() : null;
        }
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getName() != null ? user.getName() : user.getEmail(),
            role,
            universityId
        );
    }

    private UserResponse registerUserAndReturn(String email, String password, String role, String name) {
        registerUser(email, password, role, name);
        User user = userRepository.findByEmail(email).orElseThrow();
        return toResponse(user);
    }

    public void registerUser(String email, String password, String role) {
        registerUser(email, password, role, email);
    }

    public void registerUser(String email, String password, String role, String name) {
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role \"" + role + "\"");
        }

        if (userRole == UserRole.DEVELOPER) {
            throw new RuntimeException("Cannot register developers");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String displayName = name != null && !name.isBlank() ? name : email;
        String encodedPassword = passwordEncoder.encode(password);

        if (userRole == UserRole.PROFESSOR) {
            Professor professor = new Professor();
            professor.setEmail(email);
            professor.setPasswordHash(encodedPassword);
            professor.setName(displayName);
            professor.setRoles(Set.of(UserRole.PROFESSOR));
            professor.setFieldOfStudy("General");
            professorRepository.save(professor);
        } else if (userRole == UserRole.STUDENT) {
            Student student = new Student();
            student.setEmail(email);
            student.setPasswordHash(encodedPassword);
            student.setName(displayName);
            student.setRoles(Set.of(UserRole.STUDENT));
            studentRepository.save(student);
        } else {
            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(encodedPassword);
            user.setRoles(Set.of(userRole));
            user.setName(displayName);
            userRepository.save(user);
        }
    }

    public void registerDeveloper(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRoles(Set.of(UserRole.DEVELOPER));

        userRepository.save(user);
    }
}

