package com.researchhub.backend.security;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter filter) {
        this.jwtFilter = filter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                auth.requestMatchers("/error").permitAll();
                auth.requestMatchers("/test/db").permitAll();
                auth.requestMatchers("/test/student-auth").hasRole("STUDENT");
                auth.requestMatchers("/test/developer-auth").hasRole("DEVELOPER");

                auth.requestMatchers("/auth/login").permitAll();
                auth.requestMatchers("/auth/register").permitAll();
                auth.requestMatchers("/auth/refresh").permitAll();
                auth.requestMatchers("/auth/logout").permitAll();
                auth.requestMatchers("/auth/me").authenticated();

                auth.requestMatchers("/user/register").hasRole("UNIVERSITY_ADMIN");
                auth.requestMatchers("/user/register-developer").hasRole("DEVELOPER");

                auth.requestMatchers(HttpMethod.GET, "/projects", "/projects/*").permitAll();
                auth.requestMatchers(HttpMethod.POST, "/projects").hasRole("PROFESSOR");
                auth.requestMatchers(HttpMethod.PATCH, "/projects/*").authenticated();
                auth.requestMatchers(HttpMethod.DELETE, "/projects/*").authenticated();
                auth.requestMatchers(HttpMethod.POST, "/projects/*/close").authenticated();

                auth.requestMatchers("/applications", "/applications/**").authenticated();

                auth.requestMatchers(HttpMethod.GET, "/rankings").permitAll();

                auth.anyRequest().denyAll();
            })
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        // Helps if you need to read auth headers/cookies in devtools.
        config.setExposedHeaders(List.of("Set-Cookie", "Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

