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

                auth.requestMatchers("/auth/me").authenticated();
                auth.requestMatchers("/auth/**").permitAll();

                auth.requestMatchers("/user/register").hasRole("UNIVERSITY_ADMIN");

                auth.requestMatchers(HttpMethod.GET, "/students/**").permitAll();
                auth.requestMatchers(HttpMethod.POST, "/students/**").hasRole("UNIVERSITY_ADMIN");
                auth.requestMatchers(HttpMethod.PATCH, "/students/**").hasAnyRole("UNIVERSITY_ADMIN", "STUDENT");
                auth.requestMatchers(HttpMethod.DELETE, "/students/**").hasRole("UNIVERSITY_ADMIN");

                auth.requestMatchers(HttpMethod.GET, "/professors/**").permitAll();
                auth.requestMatchers(HttpMethod.POST, "/professors/**").hasRole("UNIVERSITY_ADMIN");
                auth.requestMatchers(HttpMethod.PATCH, "/professors/**").hasAnyRole("UNIVERSITY_ADMIN", "PROFESSOR");
                auth.requestMatchers(HttpMethod.DELETE, "/professors/**").hasRole("UNIVERSITY_ADMIN");

                auth.requestMatchers(HttpMethod.GET, "/projects/**").permitAll();
                auth.requestMatchers(HttpMethod.POST, "/projects/**").hasRole("PROFESSOR");
                auth.requestMatchers(HttpMethod.PATCH, "/projects/**").hasRole("PROFESSOR");
                auth.requestMatchers(HttpMethod.DELETE, "/projects/**").hasRole("PROFESSOR");

                auth.requestMatchers(HttpMethod.GET, "/applications/my-projects").hasRole("PROFESSOR");
                auth.requestMatchers(HttpMethod.GET, "/applications/**").authenticated();
                auth.requestMatchers(HttpMethod.POST, "/applications/**").hasRole("STUDENT");
                auth.requestMatchers(HttpMethod.PATCH, "/applications/**").hasAnyRole("STUDENT", "PROFESSOR"); //.hasRole("STUDENT"); TODO: separate to diff endpoints
                auth.requestMatchers(HttpMethod.DELETE, "/applications/**").hasRole("STUDENT");

                auth.requestMatchers(HttpMethod.GET, "/universities/**").permitAll();
                auth.requestMatchers(HttpMethod.POST, "/universities/**").hasRole("DEVELOPER");
                auth.requestMatchers(HttpMethod.PATCH, "/universities/**").hasRole("DEVELOPER");
                auth.requestMatchers(HttpMethod.DELETE, "/universities/**").hasRole("DEVELOPER");

                auth.requestMatchers(HttpMethod.GET, "/rankings/**").permitAll();

                auth.requestMatchers(HttpMethod.GET, "/users/**").hasAnyRole("UNIVERSITY_ADMIN", "DEVELOPER");
                auth.requestMatchers(HttpMethod.POST, "/users/**").hasAnyRole("UNIVERSITY_ADMIN", "DEVELOPER");
                auth.requestMatchers(HttpMethod.PATCH, "/users/**").hasAnyRole("UNIVERSITY_ADMIN", "DEVELOPER");
                auth.requestMatchers(HttpMethod.DELETE, "/users/**").hasAnyRole("UNIVERSITY_ADMIN", "DEVELOPER");

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

