package com.researchhub.backend.auth;

import com.researchhub.backend.security.JwtUtils;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserRole;
import com.researchhub.backend.user.UserRepository;

import java.util.Set;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    public AuthService(AuthenticationManager authManager, JwtUtils jwtUtils,
                       RefreshTokenService refreshTokenService, UserRepository userRepository) {
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
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
