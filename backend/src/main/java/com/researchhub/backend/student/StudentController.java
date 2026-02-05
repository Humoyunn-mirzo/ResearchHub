package com.researchhub.backend.student;

import com.researchhub.backend.application.Application;
import com.researchhub.backend.common.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Student>>> getAllStudents() {
        return ResponseEntity.ok(new ApiResponse<>(studentService.getStudents()));
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student created = studentService.createStudent(
                student.getName(),
                student.getEmail(),
                student.getPasswordHash(),
                student.getUniversityId(),
                student.getFieldOfInterest(),
                student.getBio()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable UUID id) {
        Student student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Student> patchStudent(@PathVariable UUID id, @RequestBody Student student) {
        Student created = studentService.patchStudent(
                id,
                student.getName(),
                student.getEmail(),
                student.getUniversityId(),
                student.getFieldOfInterest(),
                student.getBio()
                );
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{id}/applications")
    public ResponseEntity<List<Application>> getStudentApplications(@PathVariable UUID id) {
        List<Application> applications = studentService.getStudentApplications(id);
        return ResponseEntity.ok(applications);
    }
}
