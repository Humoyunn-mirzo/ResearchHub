# Applications API

## Module Structure

| File                         | Purpose |
|------------------------------|---------|
| `ApplicationStatus.java`     | Enum: PENDING, ACCEPTED, REJECTED |
| `Application.java`           | JPA entity, maps to `applications` table |
| `ApplicationRepository.java` | Spring Data JPA repository |
| `CreateApplicationRequest.java` | DTO for POST body |
| `UpdateApplicationRequest.java` | DTO for PUT body |
| `ApplicationResponse.java`   | DTO record for API responses |
| `ApplicationMapper.java`     | MapStruct mapper (entity ↔ DTO) |
| `ApplicationService.java`    | Business logic, @Transactional |
| `ApplicationController.java` | REST endpoints |

## API Endpoints

### POST /applications

**Input**

{
"studentId": "uuid",
"projectId": "uuid",
"status": "PENDING"   // optional, defaults to PENDING
}


Output: 201 Created – ApplicationResponse
Errors: 400 (invalid input, duplicate, student/project not found), 404

### GET /applications

Query parameters: page (default 0), size (default 20)

Output: 200 OK – paginated list of ApplicationResponse

### GET /applications/{id}

Output: 200 OK – ApplicationResponse
Error: 404 Not Found

### PUT /applications/{id}

**Input**

{
"status": "ACCEPTED"
}


Output: 200 OK – ApplicationResponse
Error: 404 Not Found

### DELETE /applications/{id}

Output: 204 No Content
Error: 404 Not Found

### GET /applications/students/{studentId}

Query parameters: status (optional), page, size

Output: 200 OK – paginated list of ApplicationResponse
Error: 404 Not Found (student does not exist)

### GET /applications/projects/{projectId}

Query parameters: status (optional), page, size

Output: 200 OK – paginated list of ApplicationResponse
Error: 404 Not Found (project does not exist)