package com.researchhub.backend.auth;

import com.researchhub.backend.security.JwtUtils;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.Role;
import com.researchhub.backend.user.UserRepository;

import ch.qos.logback.core.subst.Token;

import java.awt.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CookieValue;

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

    public void register(String email, String password, String role) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRoles(Set.of(Role.valueOf(role)));

        userRepository.save(user);
    }

    public TokenPair login(String email, String password) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );

        var user = userRepository.findByEmail(email).get();

        String accessToken = jwtUtils.generateToken(user.getEmail());
        var refreshToken = refreshTokenService.create(user.getId());

        return new TokenPair(accessToken, refreshToken.getToken());
    }

    public TokenPair refresh(String refreshToken) {
        var rt = refreshTokenService.validate(refreshToken);
        var user = userRepository.findById(rt.getUserId()).get();

        return new TokenPair(
            jwtUtils.generateToken(user.getEmail()),
            refreshTokenService.create(user.getId()).getToken()
        );
    }
}
