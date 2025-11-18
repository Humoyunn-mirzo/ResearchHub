package com.researchhub.backend.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService auth) {
        this.authService = auth;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {
        authService.register(req.getEmail(), req.getPassword(), req.getRole());
        return "Successfully created user";
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        TokenPair newTokens = authService.login(req.getEmail(), req.getPassword());

        return GetTokenResponse(newTokens);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@CookieValue(value = "refreshToken") String refreshToken) {
        TokenPair newTokens = authService.refresh(refreshToken);

        return GetTokenResponse(newTokens);
    }

    private ResponseEntity<LoginResponse> GetTokenResponse(TokenPair tokenPair) {
        var cookie = ResponseCookie
        .from("refreshToken", tokenPair.refreshToken())
        .secure(true)
        .httpOnly(true)
        .sameSite("Lax")
        .path("/api/auth")
        .build();

        return ResponseEntity
        .ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(new LoginResponse(tokenPair.accessToken()));
    }
}
