package com.researchhub.backend.student;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.researchhub.backend.student.exception.StudentAlreadyExistsException;
import com.researchhub.backend.student.exception.StudentNotFoundException;
import com.researchhub.backend.university.University;
import com.researchhub.backend.university.UniversityRepository;
import com.researchhub.backend.university.exception.UniversityNotFoundException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

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
            .orElseThrow(() -> new StudentNotFoundException(id));
        return studentMapper.toResponse(student);
    }

    @Transactional
    public StudentResponse createStudent(CreateStudentRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new StudentAlreadyExistsException(request.getEmail());
        }

        Student student = studentMapper.toEntity(request);

        University university = null;
        if (request.getUniversityId() != null) {
            university = universityRepository.findById(request.getUniversityId())
            .orElseThrow(() -> new UniversityNotFoundException(request.getUniversityId()));
        }

        student.setUniversity(university);

        student = studentRepository.save(student);

        return studentMapper.toResponse(student);
    }

    @Transactional
    public StudentResponse updateStudent(UUID id, UpdateStudentRequest request) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new StudentNotFoundException(id));

        studentMapper.toEntity(request, student);

        student = studentRepository.save(student);

        return studentMapper.toResponse(student);
    }

    @Transactional
    public void deleteStudent(UUID id) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException(id);
        }

        studentRepository.deleteById(id);
    }
}
