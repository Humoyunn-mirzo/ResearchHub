# 🧱 ResearchHub — Backend Setup Guide

A minimal **Spring Boot (Java 21)** backend scaffold for the ResearchHub project —  
an academic collaboration platform connecting Central Asian and EU universities.

---

## 📦 Overview

This initial version provides:
- ✅ A working **Gradle** build
- ✅ All required **Spring Boot dependencies**
- ✅ A configured Dockerfile
- ✅ **JPA** included
- ✅ Passing tests and ready for API development

---

## 🧰 Tech Stack

| Component | Version / Tool | Notes |
|------------|----------------|-------|
| **Java** | 21 (LTS) | Stable LTS release supported by Spring Boot 3.5 |
| **Spring Boot** | 3.5.x | Web, Validation, JPA, Security, Test, Lombok |
| **Gradle** | 8.14.3 (wrapper included) | Run builds with `./gradlew` |
| **Build Tool** | Gradle (Groovy DSL) | Wrapper scripts provided |
| **Test Framework** | JUnit 5 | Default Spring Boot setup |
| **Containerized Tests** | Testcontainers (Docker) | Only needed once DB is added |

---

## ⚙️ Requirements

| Tool | Minimum Version | Notes |
|------|------------------|-------|
| **Java JDK** | 21 | Required to build/run the backend |
| **Docker Desktop** | Latest | Required for Testcontainers later |
| **Gradle Wrapper** | Included | Use `./gradlew` — do **not** install Gradle globally |
| **IDE** | IntelliJ IDEA Community or VS Code | Enable **annotation processing** (for Lombok) |

---

## 🚀 Getting Started (for teammates)

Clone the repository and switch to the backend branch:
```bash
git clone <repo-url>
cd ResearchHub/backend
git checkout backend/initial-setup
```

### 1️⃣ Verify Java installation
```bash
java -version
```
Should print something like:
```
openjdk version "21.0.x"
```

### 2️⃣ Build and run tests
```bash
./gradlew clean test
./gradlew clean build
```
You should see:
```
BUILD SUCCESSFUL
```

## ✅ Verifying Setup

Run the included test suite:
```bash
./gradlew test
```

If successful, you’re ready to start adding APIs.  
Expected output:
```
BUILD SUCCESSFUL
```

---

## 🧩 Next Steps (TODO)

- [ ] Add **PostgreSQL** (via Docker Compose)
- [ ] Configure datasource in `application.yml`
- [ ] Add **Flyway** for DB migrations
- [ ] Implement **first API endpoints**
    - `/api/professors`, `/api/students`, `/api/topics`
- [ ] Add **JWT-based authentication**
- [ ] Add **integration tests** using Testcontainers
