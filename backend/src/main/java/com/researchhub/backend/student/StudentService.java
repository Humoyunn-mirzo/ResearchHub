package com.researchhub.backend.student;

import com.researchhub.backend.application.Application;
import com.researchhub.backend.application.ApplicationRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {
    private ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;

    public List<Student> getStudents() {
        return studentRepository.findAll(); // later add filtering/pagination
    }

    public Student getStudentById(UUID id) {
        return studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @Transactional
    public Student createStudent(String name, String email, UUID universityId, String fieldOfInterest, String bio) {
        if (studentRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        Student student = new Student();
        student.setName(name);
        student.setEmail(email.trim());
        student.setUniversityId(universityId);
        student.setFieldOfInterest(fieldOfInterest != null ? fieldOfInterest.trim() : null);
        student.setBio(bio != null ? bio.trim() : null);
        student.setCreatedAt(OffsetDateTime.now());
        student.setUpdatedAt(OffsetDateTime.now());

        return studentRepository.save(student);
    }

    @Transactional
    public Student patchStudent(UUID id, String name, String email, UUID universityId, String fieldOfInterest, String bio) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        if (name != null) {
            student.setName(name);
        }
        if (email != null) {
            student.setEmail(email);
        }
        if (universityId != null) {
            student.setUniversityId(universityId);
        }
        if (fieldOfInterest != null) {
            student.setFieldOfInterest(fieldOfInterest);
        }
        if (bio != null) {
            student.setBio(bio);
        }

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(UUID id) {
        if (!studentRepository.existsById(id)) {
            throw new EntityNotFoundException("Student not found");
        }

        studentRepository.deleteById(id);
    }


    // Optional: add methods to get applications for student
    public List<Application> getStudentApplications(UUID studentId) {
        return applicationRepository.findByStudentId(studentId);
    }
}
