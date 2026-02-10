package com.researchhub.backend.student;

import com.researchhub.backend.application.Application;
import com.researchhub.backend.application.ApplicationRepository;
import com.researchhub.backend.common.ApiResponse;
import com.researchhub.backend.university.University;
import com.researchhub.backend.university.UniversityRepository;
import com.researchhub.backend.user.UserRole;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final UniversityRepository universityRepository;
    private final StudentMapper studentMapper;

    public Page<StudentResponse> getStudents(Pageable pageable) {
        Page<Student> page = studentRepository.findAll(pageable);

        List<StudentResponse> content = studentMapper.toResponseList(page.getContent());

        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public StudentResponse getStudentById(UUID id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return studentMapper.toResponse(student);
    }

    @Transactional
    public StudentResponse createStudent(CreateStudentRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Student student = studentMapper.toEntity(request);

        University university = null;
        if (request.getUniversityId() != null) {
            university = universityRepository.findById(request.getUniversityId())
            .orElseThrow(() -> new EntityNotFoundException(
                "University not found: " + request.getUniversityId()
            ));
        }

        student.setUniversity(university);

        student = studentRepository.save(student);

        return studentMapper.toResponse(student);
    }

    @Transactional
    public StudentResponse updateStudent(UUID id, UpdateStudentRequest request) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        studentMapper.toEntity(request, student);

        student = studentRepository.save(student);

        return studentMapper.toResponse(student);
    }

    @Transactional
    public void deleteStudent(UUID id) {
        if (!studentRepository.existsById(id)) {
            throw new EntityNotFoundException("Student not found");
        }

        studentRepository.deleteById(id);
    }
}
