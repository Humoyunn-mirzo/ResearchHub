package com.researchhub.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class DatabaseTestController {
    private static final Logger log = LoggerFactory.getLogger(DatabaseTestController.class);


    @Autowired
    private DataSource dataSource;

    @GetMapping("/test-db")
    public String testDatabaseConnection() {
        log.info("Received /test-db request");

        try (Connection conn = dataSource.getConnection()) {
            if (!conn.isClosed()) {
                return "Connected to PostgreSQL!";
            } else {
                return "Connection is closed!";
            }
        } catch (Exception e) {
            return "Database connection FAILED: " + e.getMessage();
        }
    }
}

