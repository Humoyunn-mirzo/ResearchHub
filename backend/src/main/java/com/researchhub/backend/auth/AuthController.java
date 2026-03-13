package com.researchhub.backend.auth;

import com.researchhub.backend.professor.ProfessorService;
import com.researchhub.backend.user.UserRepository;
import com.researchhub.backend.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final ProfessorService professorService;

    public AuthController(AuthService auth, UserRepository userRepository,
                          UserService userService, RefreshTokenService refreshTokenService,
                          ProfessorService professorService) {
        this.authService = auth;
        this.userRepository = userRepository;
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
        this.professorService = professorService;
    }

    /**
     * Check if bootstrap is available (no developers exist yet).
     */
    @GetMapping("/bootstrap-available")
    public ResponseEntity<BootstrapAvailableResponse> bootstrapAvailable() {
        boolean available = userRepository.countDevelopers() == 0;
        return ResponseEntity.ok(new BootstrapAvailableResponse(available));
    }

    /**
     * Bootstrap the first admin when no developers exist.
     * Only works when count(DEVELOPER) == 0. Disabled after first admin is created.
     */
    @PostMapping("/bootstrap")
    public ResponseEntity<BootstrapResponse> bootstrap(@RequestBody BootstrapRequest req, HttpServletRequest httpReq) {
        if (userRepository.countDevelopers() > 0) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new BootstrapResponse(false, "Bootstrap disabled: at least one admin already exists"));
        }
        if (req.getEmail() == null || req.getEmail().isBlank() || req.getPassword() == null || req.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new BootstrapResponse(false, "Email and password are required"));
        }
        if (req.getPassword().length() < 8) {
            return ResponseEntity.badRequest()
                    .body(new BootstrapResponse(false, "Password must be at least 8 characters"));
        }
        userService.registerDeveloper(req.getEmail(), req.getPassword());
        var result = authService.login(req.getEmail(), req.getPassword());
        var response = new BootstrapResponse(
                true,
                "Admin created successfully",
                result.tokens().accessToken(),
                result.tokens().refreshToken(),
                AuthUserDto.fromUser(result.user()));
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.tokens().refreshToken(), httpReq).toString())
                .header(HttpHeaders.SET_COOKIE, buildAccessTokenCookie(result.tokens().accessToken(), httpReq).toString())
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, HttpServletRequest httpReq) {
        var result = authService.login(req.getEmail(), req.getPassword());
        return buildTokenResponse(result, httpReq);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletRequest httpReq) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).build();
        }
        var tokenPair = authService.refresh(refreshToken);
        var loginResponse = new LoginResponse(null, tokenPair.accessToken(), tokenPair.refreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(tokenPair.refreshToken(), httpReq).toString())
                .header(HttpHeaders.SET_COOKIE, buildAccessTokenCookie(tokenPair.accessToken(), httpReq).toString())
                .body(loginResponse);
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
        return ResponseEntity.ok(AuthUserDto.fromUser(user));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody AuthRegisterRequest req, HttpServletRequest httpReq) {
        if ("PROFESSOR".equals(req.getRole())) {
            return ResponseEntity.badRequest().build();
        }
        var name = req.getName() != null && !req.getName().isBlank() ? req.getName() : req.getEmail();
        var result = authService.registerAndLogin(req.getEmail(), req.getPassword(), req.getRole(), name);
        return buildTokenResponse(result, httpReq);
    }

    @PostMapping(value = "/register-professor", consumes = "multipart/form-data")
    public ResponseEntity<LoginResponse> registerProfessor(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam(required = false) String fieldOfStudy,
            @RequestParam(required = false) String universityIdParam,
            @RequestParam("cv") MultipartFile cvFile,
            HttpServletRequest httpReq) {
        UUID universityId = null;
        if (universityIdParam != null && !universityIdParam.isBlank()) {
            try {
                universityId = UUID.fromString(universityIdParam.trim());
            } catch (IllegalArgumentException ignored) {
                // Invalid UUID format - treat as absent
            }
        }
        professorService.registerProfessorWithCv(
                name, email, password,
                fieldOfStudy != null && !fieldOfStudy.isBlank() ? fieldOfStudy : "General",
                universityId, cvFile);
        var result = authService.login(email, password);
        return buildTokenResponse(result, httpReq);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletRequest httpReq) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.invalidate(refreshToken);
        }
        boolean secure = httpReq.isSecure();
        var refreshCookie = ResponseCookie.from("refreshToken", "")
                .maxAge(0)
                .path("/api/auth/refresh")
                .httpOnly(true)
                .secure(secure)
                .build();
        var accessCookie = ResponseCookie.from("access_token", "")
                .maxAge(0)
                .path("/")
                .httpOnly(true)
                .secure(secure)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .build();
    }

    private ResponseEntity<LoginResponse> buildTokenResponse(AuthService.LoginResult result, HttpServletRequest httpReq) {
        var refreshCookie = buildRefreshCookie(result.tokens().refreshToken(), httpReq);
        var accessCookie = buildAccessTokenCookie(result.tokens().accessToken(), httpReq);
        var response = new LoginResponse(
                AuthUserDto.fromUser(result.user()),
                result.tokens().accessToken(),
                result.tokens().refreshToken()
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(response);
    }

    private ResponseCookie buildAccessTokenCookie(String accessToken, HttpServletRequest httpReq) {
        boolean secure = httpReq.isSecure();
        return ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(60 * 15) // 15 min, match JWT expiry
                .build();
    }

    private ResponseCookie buildRefreshCookie(String refreshToken, HttpServletRequest httpReq) {
        boolean secure = httpReq.isSecure();
        return ResponseCookie.from("refreshToken", refreshToken)
                .secure(secure)
                .httpOnly(true)
                .sameSite("Lax")
                .path("/api/auth/refresh")
                .maxAge(60 * 60 * 24 * 30) // 30 days
                .build();
    }
}
