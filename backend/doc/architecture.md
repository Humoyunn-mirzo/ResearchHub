# Backend Architecture Overview

This document explains all major backend layers used in a Spring Boot application:
Controller, DTO, Model (Entity), Repository, and Service.

It describes how each layer works, how they interact, and why they exist.

---

## Table of Contents

1. [Controller Layer](#controller-layer)
2. [DTO Layer](#dto-layer)
3. [Model (Entity) Layer](#model-entity-layer)
4. [Repository Layer](#repository-layer)
5. [Service Layer](#service-layer)
6. [Layer Interaction Summary](#layer-interaction-summary)
7. [Folder Structure Example](#folder-structure-example)

---

## Controller Layer

The controller layer defines the API endpoints exposed to clients (frontend, mobile apps, other services).

Controllers:
- Map HTTP routes to Java methods using `@GetMapping`, `@PostMapping`, etc.
- Receive request DTOs, delegate logic to services, and return response DTOs.
- Should contain no business logic.

Controllers must remain thin. They are only responsible for handling HTTP requests and producing HTTP responses.

Example responsibilities:
- Parse incoming data
- Trigger service methods
- Return JSON responses
- Set HTTP status codes

Controllers should NOT:
- Access the database
- Contain business logic
- Create or modify entities directly

---

## DTO Layer

DTOs (Data Transfer Objects) define the shape of data exchanged between the backend and the client.

DTOs exist because:
- Entities contain sensitive or internal fields
- Entities often include relationships that break JSON serialization
- API responses must remain stable even if database schema changes
- Different API actions require different data shapes (e.g., CreateUserRequest vs UserResponse)

Types of DTOs:
- Request DTOs (e.g., CreateUserRequest)
- Response DTOs (e.g., UserResponse)
- Authentication DTOs (LoginRequest, LoginResponse)
- Update DTOs (UpdateUserRequest)

DTOs protect your API from leaking internal database details.

---

## Model (Entity) Layer

The model layer contains database entities annotated with JPA/Hibernate.

Entities:
- Map directly to database tables
- Define fields, constraints, and relationships
- Represent the stored data structure

Entities should NOT be returned directly in API responses because they may:
- Contain sensitive fields
- Produce infinite recursion via relationships
- Change frequently as database schema evolves

Entities are internal to the backend and interact only with repositories and services.

---

## Repository Layer

The repository layer provides all database access through Spring Data JPA.

Repositories:
- Perform CRUD operations
- Generate queries automatically from method names
- May contain custom JPQL/SQL queries
- Interact ONLY with entities, NEVER DTOs

Repositories do NOT implement business logic. They simply fetch and store data.

They form the connection between the service layer and the database.

---

## Service Layer

The service layer contains the application’s business logic.

Services:
- Coordinate multiple repositories
- Implement business rules
- Validate domain conditions
- Convert entities ↔ DTOs using mappers
- Ensure controllers remain thin

Controllers call services.  
Services call repositories.  
Repositories access the database.

Services must not:
- Handle HTTP requests
- Return entities directly to controllers
- Perform database-specific logic outside repositories

Services make the backend modular, testable, and maintainable.

---

## Layer Interaction Summary

The backend architecture follows a clean, layered design:

```
Client
  ↓
Controller  → receives HTTP requests, returns HTTP responses
  ↓
Service     → contains business logic
  ↓
Repository  → handles database access via JPA
  ↓
Database
```

Supporting flow:
- DTOs travel between Controller ↔ Service
- Entities travel between Service ↔ Repository

This structure ensures:
- Security
- Maintainability
- Testability
- Clean separation of concerns

---

## Directory Structure

```
src/main/java/com/researchhub/backend/
    controller/
        UserController.java
        ProjectController.java
        ...

    dto/
        CreateUserRequest.java
        UserResponse.java
        ...

    model/
        User.java
        Project.java
        ...

    repository/
        UserRepository.java
        ProjectRepository.java
        ...

    service/
        UserService.java
        ProjectService.java
        ...

docs/
    architecture.md   ← this file
```
