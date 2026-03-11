package com.researchhub.backend.auth;

import com.researchhub.backend.security.JwtUtils;
import com.researchhub.backend.user.User;
import com.researchhub.backend.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

    @Value("${app.frontend-url:https://usp.uz}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(JwtUtils jwtUtils,
                                              RefreshTokenService refreshTokenService,
                                              UserService userService) {
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            redirectToLoginWithError(response, "oauth_email_missing");
            return;
        }
        String name = oauth2User.getAttribute("name");
        if (name == null) {
            name = oauth2User.getAttribute("given_name");
            if (name != null && oauth2User.getAttribute("family_name") != null) {
                name = name + " " + oauth2User.getAttribute("family_name");
            }
        }
        if (name == null) {
            name = email;
        }

        User user = userService.findOrCreateFromOAuth(email, name);

        String accessToken = jwtUtils.generateToken(user.getEmail());
        var refreshToken = refreshTokenService.create(user.getId());

        boolean secure = request.isSecure();
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(60 * 15)
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                .secure(secure)
                .httpOnly(true)
                .sameSite("Lax")
                .path("/api/auth/refresh")
                .maxAge(60 * 60 * 24 * 30)
                .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());

        String redirectUrl = frontendUrl + "/login?oauth=success";
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private void redirectToLoginWithError(HttpServletResponse response, String error) throws IOException {
        String redirectUrl = frontendUrl + "/login?error=" + error;
        response.sendRedirect(redirectUrl);
    }
}
