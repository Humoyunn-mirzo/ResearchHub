package com.researchhub.backend.security;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/test/db").permitAll();
                auth.requestMatchers("/test/student-auth").hasRole("STUDENT");

                auth.requestMatchers("/auth/**").permitAll();

                auth.requestMatchers("/user/register").hasRole("UNIVERSITY_ADMIN");

                auth.requestMatchers(HttpMethod.GET, "/universities/**").permitAll();

                auth.requestMatchers(HttpMethod.GET, "students/**").authenticated();
                auth.requestMatchers(HttpMethod.POST, "students").hasRole("UNIVERSITY_ADMIN");
                auth.requestMatchers(HttpMethod.PATCH, "students/**").hasRole("UNIVERSITY_ADMIN");

                auth.anyRequest().hasRole("DEVELOPER");
            })
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
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

