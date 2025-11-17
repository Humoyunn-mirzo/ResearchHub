package com.researchhub.backend.service;

import com.researchhub.backend.config.JwtUtils;
import com.researchhub.backend.dto.*;
import com.researchhub.backend.entity.User;
import com.researchhub.backend.entity.enums.Role;
import com.researchhub.backend.repository.UserRepository;

import java.awt.List;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authManager, JwtUtils jwtUtils,
                       RefreshTokenService refreshTokenService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse register(String email, String password, String role) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRoles(Set.of(Role.valueOf(role)));

        userRepository.save(user);

        String accessToken = jwtUtils.generateToken(user.getEmail());
        var refreshToken = refreshTokenService.create(user.getId());

        return new LoginResponse(accessToken, refreshToken.getToken());
    }

    public LoginResponse login(String email, String password) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );

        var user = userRepository.findByEmail(email).get();

        String accessToken = jwtUtils.generateToken(user.getEmail());
        var refreshToken = refreshTokenService.create(user.getId());

        return new LoginResponse(accessToken, refreshToken.getToken());
    }

    public LoginResponse refresh(String token) {
        var rt = refreshTokenService.validate(token);
        var user = userRepository.findById(rt.getUserId()).get();

        return new LoginResponse(
            jwtUtils.generateToken(user.getEmail()),
            refreshTokenService.create(user.getId()).getToken()
        );
    }
}

