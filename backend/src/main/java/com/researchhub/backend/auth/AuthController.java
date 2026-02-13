package com.researchhub.backend.auth;

import com.researchhub.backend.user.RegisterRequest;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserRepository;
import com.researchhub.backend.user.UserRole;
import com.researchhub.backend.user.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(
            AuthService auth,
            UserRepository userRepository,
            UserService userService,
            RefreshTokenService refreshTokenService
    ) {
        this.authService = auth;
        this.userRepository = userRepository;
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, HttpServletRequest httpReq) {
        TokenPair newTokens = authService.login(req.getEmail(), req.getPassword());

        return getTokenResponse(newTokens, req.getEmail(), httpReq);
    }

    /**
     * Local-dev self registration endpoint used by the frontend.
     * Allows STUDENT / PROFESSOR only.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req, HttpServletRequest httpReq) {
        if (req == null || req.getEmail() == null || req.getEmail().isBlank()
                || req.getPassword() == null || req.getPassword().isBlank()
                || req.getRole() == null || req.getRole().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorBody("Email, password, and role are required"));
        }
        // Only allow student/professor self-register in this endpoint.
        UserRole role;
        try {
            role = UserRole.valueOf(req.getRole());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        if (role != UserRole.STUDENT && role != UserRole.PROFESSOR) {
            return ResponseEntity.status(403).build();
        }

        try {
            userService.registerUser(req.getEmail(), req.getPassword(), req.getRole());
        } catch (RuntimeException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("already exists") || msg.contains("Email already exists")) {
                return ResponseEntity.status(409).body(new ErrorBody("Email already registered"));
            }
            if (msg.contains("Invalid role") || msg.contains("Cannot register")) {
                return ResponseEntity.status(400).body(new ErrorBody(msg));
            }
            throw e;
        }

        TokenPair newTokens = authService.login(req.getEmail(), req.getPassword());
        return getTokenResponse(newTokens, req.getEmail(), httpReq);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @RequestBody(required = false) RefreshRequest body,
            @CookieValue(value = "refreshToken", required = false) String refreshTokenCookie,
            HttpServletRequest httpReq
    ) {
        String rt = (body != null && body.getRefreshToken() != null && !body.getRefreshToken().isBlank())
                ? body.getRefreshToken()
                : refreshTokenCookie;

        if (rt == null || rt.isBlank()) {
            return ResponseEntity.status(401).build();
        }

        // Resolve user from refresh token for frontend response payload.
        User user;
        try {
            var refreshToken = refreshTokenService.validate(rt);
            user = userRepository.findById(refreshToken.getUserId()).orElse(null);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        TokenPair newTokens = authService.refresh(rt);

        return getTokenResponse(newTokens, user.getEmail(), httpReq);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpReq) {
        var cookie = ResponseCookie
                .from("refreshToken", "")
                .secure(httpReq.isSecure())
                .httpOnly(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserDto> me() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        var user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(toUserDto(user));
    }

    private ResponseEntity<LoginResponse> getTokenResponse(TokenPair tokenPair, String emailHint, HttpServletRequest httpReq) {
        boolean secure = httpReq.isSecure(); // localhost http -> false

        var cookie = ResponseCookie
        .from("refreshToken", tokenPair.refreshToken())
        .secure(secure)
        .httpOnly(true)
        .sameSite("Lax")
        .path("/")
        .build();

        var user = (emailHint != null) ? userRepository.findByEmail(emailHint).orElse(null) : null;
        if (user == null) {
            return ResponseEntity.status(500).build();
        }
        AuthUserDto userDto = toUserDto(user);

        return ResponseEntity
            .ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(new LoginResponse(userDto, tokenPair.accessToken(), tokenPair.refreshToken()));
    }

    private AuthUserDto toUserDto(User user) {
        AuthUserDto userDto = new AuthUserDto();
        userDto.setId(user.getId().toString());
        userDto.setEmail(user.getEmail());
        userDto.setName(user.getEmail()); // backend doesn't store names yet
        // Map backend DEVELOPER to frontend PLATFORM_ADMIN for compatibility.
        var roles = user.getRoles();
        var role = (roles != null && !roles.isEmpty())
                ? roles.iterator().next().name()
                : "STUDENT";
        if ("DEVELOPER".equals(role)) role = "PLATFORM_ADMIN";
        userDto.setRole(role);
        userDto.setUniversityId(null);
        userDto.setCreatedAt(Instant.now().toString());
        return userDto;
    }
}
