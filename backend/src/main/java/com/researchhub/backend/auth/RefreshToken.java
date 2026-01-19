package com.researchhub.backend.auth;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    private String token;

    @Column(columnDefinition = "uuid", nullable = false)
    private UUID userId;

    private Instant expiryDate;
}
