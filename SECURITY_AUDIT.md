# ResearchHub Security & Code Quality Audit Report
**Date:** March 1, 2026  
**Status:** ⚠️ CRITICAL ISSUES FOUND

---

## 🔴 CRITICAL ISSUES

### 1. **Unsafe Optional Handling in AuthService** 
**File:** `backend/src/main/java/com/researchhub/backend/auth/AuthService.java`  
**Lines:** 36, 46  
**Severity:** CRITICAL (Could cause NullPointerException)

```java
// ❌ DANGEROUS - Using .get() without check
var user = userRepository.findByEmail(email).get();  // Line 36
var user = userRepository.findById(rt.getUserId()).get();  // Line 46
```

**Risk:** If user is not found after successful authentication, app crashes with NPE  
**Fix:** Use `.orElseThrow()` with proper exception:
```java
// ✅ CORRECT
var user = userRepository.findByEmail(email)
    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
```

---

### 2. **Missing Error Handling for JWT Operations**
**File:** `backend/src/main/java/com/researchhub/backend/security/JwtUtils.java`  
**Method:** `extractEmail()`

```java
// ❌ NO ERROR HANDLING
public String extractEmail(String token) {
    return Jwts.parserBuilder()
            .setSigningKey(...)
            .build()
            .parseClaimsJws(token)  // Can throw JwtException, ExpiredJwtException
            .getBody()
            .getSubject();
}
```

**Risk:** Invalid or expired tokens cause unhandled exceptions  
**Fix:** Add try-catch and return graceful errors in GlobalExceptionHandler

---

### 3. **Incomplete Global Exception Handler**
**File:** `backend/src/main/java/com/researchhub/backend/common/GlobalExceptionHandler.java`

**Missing handlers for:**
- `JwtException` (all JWT-related errors)
- `BadCredentialsException` (failed login)
- `DataIntegrityViolationException` (duplicate key, constraints)
- `MethodArgumentNotValidException` (validation failures)
- `HttpMessageNotReadableException` (malformed JSON)

**Risk:** Returns generic 500 error instead of specific HTTP status codes  
**Impact:** Poor API experience and security exposure

---

### 4. **Insecure Cookie Configuration**
**File:** `backend/src/main/java/com/researchhub/backend/auth/AuthController.java`  
**Line:** `secure(true)`

```java
var cookie = ResponseCookie
    .from("refreshToken", tokenPair.refreshToken())
    .secure(true)  // ❌ Won't work in development without HTTPS
    .httpOnly(true)
    .sameSite("Lax")
    .path("/api/auth/refresh")
    .build();
```

**Risk:** 
- Cookies won't be sent over HTTP in development
- Must handle HTTPS/HTTP in production vs development

**Fix:** Make it environment-dependent:
```java
.secure(environment.is("prod"))  // or use property
```

---

### 5. **Generic RuntimeException Usage**
**File:** `backend/src/main/java/com/researchhub/backend/auth/RefreshTokenService.java`  
**Line:** 28

```java
.orElseThrow(() -> new RuntimeException("Invalid refresh token"));
```

**File:** `backend/src/main/java/com/researchhub/backend/user/UserService.java`  

**Risk:** 
- Prevents proper HTTP status code mapping
- All errors return 500 instead of 401/400
- Hard to test error scenarios

**Fix:** Create custom exceptions:
```java
public class InvalidRefreshTokenException extends ApiException {
    public InvalidRefreshTokenException() {
        super("Invalid refresh token", HttpStatus.UNAUTHORIZED);
    }
}
```

---

## 🟠 HIGH PRIORITY ISSUES

### 6. **No Input Validation on DTOs**
**Files:**
- `LoginRequest`
- `CreateProjectRequest`
- `CreateApplicationRequest`
- All other request DTOs

**Issue:** No `@NotNull`, `@NotBlank`, `@Email`, `@Size` annotations

**Risk:** 
- Empty/invalid data reaches business logic
- SQL injection possible if not escaped
- Poor error messages for clients

**Fix:** Add validation annotations:
```java
@Data
public class LoginRequest {
    @NotNull(message = "Email required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password required")
    @Size(min = 8, message = "Password too short")
    private String password;
}
```

---

### 7. **No Method-Level Access Control**
**File:** `backend/src/main/java/com/researchhub/backend/professor/ProfessorService.java`

**Issue:** Service methods lack `@PreAuthorize` or `@Secured` annotations

**Risk:** 
- Bypassing SecurityConfig possible
- Direct service calls from other services skip authorization

**Fix:** Add explicit authorization:
```java
@PreAuthorize("hasRole('PROFESSOR')")
public ProjectResponse createProject(@RequestBody CreateProjectRequest request) { ... }
```

---

### 8. **Hardcoded Server Names in Frontend**
**File:** `compose.yaml`

```yaml
NEXT_PUBLIC_API_URL: /api  # Only works in development
```

**Issue:** Production will need different URL  
**Fix:** Use runtime environment variable or configuration file

---

### 9. **No Rate Limiting on Auth Endpoints**
**Endpoints:** 
- `POST /auth/login`
- `POST /auth/refresh`

**Risk:**
- Brute force attacks on login
- No throttling on token refresh

**Fix:** Add Spring Security rate limiting or use `@RateLimited` annotation

---

### 10. **Unsafe JWT Secret Management**
**File:** `backend/src/main/resources/application.yaml`

```yaml
JWT_SECRET=${JWT_SECRET}  # Stored in .env file
```

**Issue:** `.env` file committed to git could leak secrets  
**Risk:** Review `.gitignore` to ensure `.env` is ignored

**Check:** 
```bash
git log --all --full-history -- .env
```

**Fix:** Store in secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)

---

## 🟡 MEDIUM PRIORITY ISSUES

### 11. **TODO Items in Production Code**
**Issues Found:**
1. **SecurityConfig.java:55** - "TODO: separate to diff endpoints"
   - `/applications/**` PATCH has unclear role separation

2. **openapi.yaml:119** - "TODO: maybe enforce some conditions"  
   - Interview object validation incomplete

3. **openapi.yaml:411** - "TODO: think about the 'interview' object"  
   - Interview schema not properly defined

**Action:** Address all TODOs before production release

---

### 12. **Missing Database Indexes**
**Current:** Only indexes on foreign keys and commonly filtered fields  
**Missing:**
- Email columns (used in queries)
- Status columns (used for filtering)
- Timestamps (used for sorting)

**Performance Impact:** Slow queries on large datasets

---

### 13. **No Pagination Limits**
**File:** Controllers (ProjectController, StudentController, etc.)

```java
@RequestParam(defaultValue = "20") int size
```

**Risk:** Client can request unlimited results (DoS attack)  
**Fix:** 
```java
@RequestParam(defaultValue = "20") @Max(100) int size
```

---

### 14. **Incomplete Error Responses**
**Current Response:**
```json
{
  "error": "An error occurred"
}
```

**Should be:**
```json
{
  "code": "PROJECT_NOT_FOUND",
  "message": "Project with ID ... not found",
  "details": { ... }
}
```

---

### 15. **N+1 Query Problem**
**File:** `backend/src/main/java/com/researchhub/backend/rankings/RankingsService.java`  
**Issue:** Fetching rankings may load all related projects/professors one by one

**Fix:** Use `@Query` with JOIN or `fetchGraph`

---

## 🟢 RECOMMENDATIONS

### 16. **Add Request Logging**
Currently no logging of API requests for debugging/auditing

**Fix:** Add filter/interceptor:
```java
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    // Log method, URL, parameters, response status
}
```

---

### 17. **Implement CORS Configuration**
Currently handled by Nginx, but backend should also have it

**Fix:**
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost", "https://usp.uz")
                    .allowedMethods("GET", "POST", "PATCH", "DELETE");
            }
        };
    }
}
```

---

### 18. **Add Actuator Endpoints** (for monitoring)
```gradle
implementation 'org.springframework.boot:spring-boot-starter-actuator'
```

---

### 19. **Implement Proper Logging**
No structured logging in services

**Fix:** Use Logback with patterns:
```java
log.info("User {} logged in at {}", email, Instant.now());
```

---

### 20. **Add Database Connection Pooling Configuration**
Currently using default HikariCP  
**Recommendation:** Tune for production:
```yaml
spring.datasource.hikari.maximum-pool-size: 20
spring.datasource.hikari.minimum-idle: 5
```

---

## 📋 SUMMARY

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 5 | Must fix before production |
| 🟠 High | 6 | Should fix soon |
| 🟡 Medium | 6 | Nice to have |
| 🟢 Green | 3 | Recommendations |

**Total Issues:** 20

---

## 🚀 ACTION PLAN

### Phase 1: Critical Fixes (Now)
- [ ] Fix AuthService Optional handling
- [ ] Add JWT error handling
- [ ] Enhance GlobalExceptionHandler
- [ ] Fix cookie configuration
- [ ] Replace RuntimeExceptions

### Phase 2: High Priority (This Sprint)
- [ ] Add input validation on all DTOs
- [ ] Add method-level authorization
- [ ] Add rate limiting

### Phase 3: Medium Priority (Next Sprint)
- [ ] Resolve all TODOs
- [ ] Add database indexes
- [ ] Implement pagination limits

### Phase 4: Production Readiness
- [ ] Add request logging
- [ ] CORS configuration
- [ ] Database tuning
- [ ] Security review

---

**Generated:** March 1, 2026  
**Auditor:** Code Analysis System
