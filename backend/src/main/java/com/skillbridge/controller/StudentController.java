
package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.Student;
import com.skillbridge.services.StudentService;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isFaculty(Authentication auth) {
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_FACULTY"));
    }

    private boolean isStudent(Authentication auth) {
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
    }

    // Admin only: Add student manually
    @PostMapping
    public ResponseEntity<Student> addStudent(Authentication auth,
                                               @RequestBody Student student) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        student.setUser(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentService.addStudent(student));
    }

    // Faculty and Admin: View all students
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(
            Authentication auth) {

        if (!isAdmin(auth) && !isFaculty(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // Student: View own profile
    @GetMapping("/me")
    public ResponseEntity<Student> getMyProfile(Authentication auth) {

        if (!isStudent(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Student student =
                studentService.getStudentByUserEmail(auth.getName());

        return student == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(student);
    }

    // Student: Own profile; Faculty/Admin: Any profile
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(
            @PathVariable Long id,
            Authentication auth) {

        Student student = studentService.getStudentById(id);

        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student own = studentService.getStudentByUserEmail(
                    auth.getName());

            if (own == null || !own.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth) && !isFaculty(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(student);
    }

    // Student: Update own profile; Admin: Update any profile
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody Student student,
            Authentication auth) {

        Student existing = studentService.getStudentById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student own = studentService.getStudentByUserEmail(
                    auth.getName());

            if (own == null || !own.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        existing.setName(student.getName());
        existing.setPhone(student.getPhone());
        existing.setCareerGoal(student.getCareerGoal());

        return ResponseEntity.ok(studentService.addStudent(existing));
    }

    // Student: Delete own profile; Admin: Delete any profile
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(
            @PathVariable Long id,
            Authentication auth) {

        Student existing = studentService.getStudentById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student own = studentService.getStudentByUserEmail(
                    auth.getName());

            if (own == null || !own.getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
