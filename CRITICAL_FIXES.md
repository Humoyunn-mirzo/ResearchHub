# Quick Fix Guide - Top 5 Critical Issues

## 1️⃣ Fix AuthService Optional Handling [CRITICAL]

**File:** `backend/src/main/java/com/researchhub/backend/auth/AuthService.java`

```java
// BEFORE (❌ Dangerous)
public TokenPair login(String email, String password) {
    authManager.authenticate(
        new UsernamePasswordAuthenticationToken(email, password)
    );
    var user = userRepository.findByEmail(email).get();  // NPE risk!
    // ...
}

// AFTER (✅ Safe)
public TokenPair login(String email, String password) {
    authManager.authenticate(
        new UsernamePasswordAuthenticationToken(email, password)
    );
    var user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    // ...
}
```

**Similarly for line 46:**
```java
public TokenPair refresh(String refreshToken) {
    var rt = refreshTokenService.validate(refreshToken);
    var user = userRepository.findById(rt.getUserId())
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    // ...
}
```

---

## 2️⃣ Add JWT Exception Handling [CRITICAL]

**File:** `backend/src/main/java/com/researchhub/backend/security/JwtUtils.java`

```java
// ADD to GlobalExceptionHandler.java
@ExceptionHandler(JwtException.class)
public ResponseEntity<ApiErrorResponse> handleJwtException(JwtException ex) {
    log.warn("JWT parsing failed: {}", ex.getMessage());
    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(new ApiErrorResponse(new ApiError("Invalid or expired token")));
}

@ExceptionHandler(BadCredentialsException.class)
public ResponseEntity<ApiErrorResponse> handleBadCredentials(BadCredentialsException ex) {
    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(new ApiErrorResponse(new ApiError("Invalid email or password")));
}
```

---

## 3️⃣ Fix Cookie Secure Flag [CRITICAL]

**File:** `backend/src/main/java/com/researchhub/backend/auth/AuthController.java`

```java
private ResponseEntity<LoginResponse> GetTokenResponse(TokenPair tokenPair) {
    // Determine if HTTPS is enabled (check environment)
    boolean isProduction = "prod".equals(System.getenv("APP_ENV"));
    
    var cookie = ResponseCookie
        .from("refreshToken", tokenPair.refreshToken())
        .secure(isProduction)  // ✅ Only HTTPS in production
        .httpOnly(true)
        .sameSite("Lax")
        .path("/api/auth/refresh")
        .maxAge(60 * 60 * 24 * 7)  // 7 days
        .build();

    return ResponseEntity
        .ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(new LoginResponse(tokenPair.accessToken()));
}
```

---

## 4️⃣ Replace Generic RuntimeExceptions [CRITICAL]

**Create Custom Exceptions:**

```java
// backend/src/main/java/com/researchhub/backend/error/InvalidRefreshTokenException.java
package com.researchhub.backend.error;

public class InvalidRefreshTokenException extends ApiException {
    public InvalidRefreshTokenException(String message) {
        super(message, org.springframework.http.HttpStatus.UNAUTHORIZED);
    }
}

// backend/src/main/java/com/researchhub/backend/error/InvalidRoleException.java
public class InvalidRoleException extends ApiException {
    public InvalidRoleException(String role) {
        super("Invalid role: " + role, org.springframework.http.HttpStatus.BAD_REQUEST);
    }
}

// backend/src/main/java/com/researchhub/backend/error/UserAlreadyExistsException.java
public class UserAlreadyExistsException extends ApiException {
    public UserAlreadyExistsException(String email) {
        super("User with email " + email + " already exists", 
              org.springframework.http.HttpStatus.CONFLICT);
    }
}
```

**Update UserService & RefreshTokenService to use them:**

```java
// UserService.java
if (userRepository.findByEmail(email).isPresent()) {
    throw new UserAlreadyExistsException(email);  // ✅ Custom exception
}

// RefreshTokenService.java
.orElseThrow(() -> new InvalidRefreshTokenException("Invalid refresh token"));
```

---

## 5️⃣ Add Input Validation [CRITICAL]

**Add to pom.xml or build.gradle:**
```gradle
implementation 'org.springframework.boot:spring-boot-starter-validation'
```

**Update Request DTOs:**

```java
// backend/src/main/java/com/researchhub/backend/auth/LoginRequest.java
package com.researchhub.backend.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequest {
    @NotNull(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}

// backend/src/main/java/com/researchhub/backend/project/CreateProjectRequest.java
@Data
public class CreateProjectRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 255, message = "Title must be 5-255 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 50, message = "Description must be at least 50 characters")
    private String description;
    
    @NotNull(message = "Professor ID is required")
    private UUID professorId;
    
    @Min(value = 1, message = "Must have at least 1 slot")
    @Max(value = 20, message = "Cannot exceed 20 slots")
    private Integer slots;
}

// Add @Valid to controllers:
@PostMapping
public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
    @Valid @RequestBody CreateProjectRequest request) {
    // ...
}
```

---

## Testing Checklist

After implementing fixes, test:

```bash
# 1. Invalid JWT token
curl -H "Authorization: Bearer invalid_token" http://localhost:8080/api/projects

# 2. Expired token
curl -H "Authorization: Bearer expired_token" http://localhost:8080/api/projects

# 3. Invalid email format
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"test1234"}'

# 4. Duplicate user registration
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@test.com","password":"test1234"}'
```

---

## Estimated Effort
- **Critical Fixes:** 2-3 hours
- **Testing:** 1 hour
- **Total:** 3-4 hours of work

---

**Priority:** Complete these before production deployment!
