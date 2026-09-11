
package com.skillbridge.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.Student;
import com.skillbridge.services.StudentService;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // Add Student
    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return studentService.addStudent(student);
    }

    // Get All Students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    // Get Student By ID
    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    @PutMapping("/{id}")
public Student updateStudent(
        @PathVariable Long id,
        @RequestBody Student student) {

    Student existingStudent = studentService.getStudentById(id);

    if (existingStudent == null) {
        return null;
    }

    existingStudent.setName(student.getName());
    existingStudent.setEmail(student.getEmail());
    existingStudent.setPhone(student.getPhone());
    existingStudent.setCareerGoal(student.getCareerGoal());

    return studentService.addStudent(existingStudent);
}

    // Delete Student
    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return "Student deleted successfully";
    }
}