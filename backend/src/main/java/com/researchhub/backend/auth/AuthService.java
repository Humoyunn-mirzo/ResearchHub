package com.researchhub.backend.auth;

import com.researchhub.backend.security.JwtUtils;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserRepository;
import com.researchhub.backend.user.UserService;

import org.springframework.security.authentication.*;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final UserService userService;

    public AuthService(AuthenticationManager authManager, JwtUtils jwtUtils,
                       RefreshTokenService refreshTokenService, UserRepository userRepository,
                       UserService userService) {
        this.authManager = authManager;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public record LoginResult(User user, TokenPair tokens) {}

    public LoginResult login(String email, String password) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );

        var user = userRepository.findByEmail(email).orElseThrow();

        String accessToken = jwtUtils.generateToken(user.getEmail());
        var refreshToken = refreshTokenService.create(user.getId());

        return new LoginResult(user, new TokenPair(accessToken, refreshToken.getToken()));
    }

    public LoginResult registerAndLogin(String email, String password, String role, String name) {
        userService.registerUser(email, password, role, name);
        return login(email, password);
    }

    public TokenPair refresh(String refreshToken) {
        var rt = refreshTokenService.validate(refreshToken);
        var user = userRepository.findById(rt.getUserId()).orElseThrow();

        return new TokenPair(
            jwtUtils.generateToken(user.getEmail()),
            refreshTokenService.create(user.getId()).getToken()
        );
    }
}
