# ===== BASE IMAGE (shared for test + build) =====
FROM eclipse-temurin:21 AS base
WORKDIR /app
COPY gradlew .
COPY gradle ./gradle
COPY settings.gradle .
COPY build.gradle .

# Pre-download dependencies for caching
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true


# ===== TEST STAGE =====
FROM base AS test
COPY . .
RUN ./gradlew test --no-daemon


# ===== BUILD STAGE =====
FROM base AS builder
COPY . .
RUN ./gradlew bootJar --no-daemon -x test


# ===== RUNTIME STAGE =====
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
CMD ["java", "-jar", "app.jar"]

