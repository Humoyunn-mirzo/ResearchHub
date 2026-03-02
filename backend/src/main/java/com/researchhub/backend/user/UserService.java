package com.researchhub.backend.user;

import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.researchhub.backend.professor.Professor;
import com.researchhub.backend.professor.ProfessorRepository;
import com.researchhub.backend.student.Student;
import com.researchhub.backend.student.StudentRepository;

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
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRoles(Set.of(UserRole.DEVELOPER));

        userRepository.save(user);
    }
}

