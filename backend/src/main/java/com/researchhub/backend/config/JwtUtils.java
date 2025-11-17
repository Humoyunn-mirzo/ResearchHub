package com.researchhub.backend.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {

    @Value("${JWT_SECRET}")
    private String jwtSecret;
    private final long jwtExpirationMs = 1000 * 60 * 15; // 15 min

    public String generateToken(String email) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret)))
                .compact();

    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Decoders.BASE64.decode(jwtSecret))
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}

