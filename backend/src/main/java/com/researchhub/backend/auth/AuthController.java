package com.researchhub.backend.auth;

import com.researchhub.backend.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthService auth, UserRepository userRepository,
                          RefreshTokenService refreshTokenService) {
        this.authService = auth;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
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
        var name = req.getName() != null && !req.getName().isBlank() ? req.getName() : req.getEmail();
        var result = authService.registerAndLogin(req.getEmail(), req.getPassword(), req.getRole(), name);
        return buildTokenResponse(result, httpReq);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.invalidate(refreshToken);
        }
        var cookie = ResponseCookie.from("refreshToken", "")
                .maxAge(0)
                .path("/api/auth/refresh")
                .httpOnly(true)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    private ResponseEntity<LoginResponse> buildTokenResponse(AuthService.LoginResult result, HttpServletRequest httpReq) {
        var cookie = buildRefreshCookie(result.tokens().refreshToken(), httpReq);
        var response = new LoginResponse(
                AuthUserDto.fromUser(result.user()),
                result.tokens().accessToken(),
                result.tokens().refreshToken()
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
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
