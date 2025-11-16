package com.researchhub.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;

@Configuration
public class RoleHierarchyConfig {

    @Bean
    public static RoleHierarchyImpl fromHierarchy() {
        return RoleHierarchyImpl.fromHierarchy(
            """
            ROLE_DEVELOPER > ROLE_PROFESSOR
            ROLE_DEVELOPER > ROLE_STUDENT
            ROLE_DEVELOPER > ROLE_UNIVERSITY_ADMIN
            """);
    }

}

