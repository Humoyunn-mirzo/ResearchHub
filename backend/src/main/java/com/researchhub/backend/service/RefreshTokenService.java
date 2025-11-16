package com.researchhub.backend.service;

import com.researchhub.backend.model.RefreshToken;
import com.researchhub.backend.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    public RefreshToken create(Long userId) {
        RefreshToken token = new RefreshToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUserId(userId);
        token.setExpiryDate(Instant.now().plusSeconds(60 * 60 * 24 * 30)); // 30 days

        return repo.save(token);
    }

    public RefreshToken validate(String token) {
        RefreshToken rt = repo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (rt.getExpiryDate().isBefore(Instant.now())) {
            repo.delete(rt);
            throw new RuntimeException("Expired refresh token");
        }

        return rt;
    }
}

