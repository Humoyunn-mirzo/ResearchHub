package com.researchhub.backend.user;

import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(String email, String password, String role) {
        registerUser(email, password, role, email);
    }

    public void registerUser(String email, String password, String role, String name) {
        // check if role is valid
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

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRoles(Set.of(UserRole.valueOf(role)));
        user.setName(name != null && !name.isBlank() ? name : email);

        userRepository.save(user);
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

