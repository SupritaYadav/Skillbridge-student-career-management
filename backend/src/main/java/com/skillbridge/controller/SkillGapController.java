
package com.skillbridge.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.Student;
import com.skillbridge.services.SkillGapService;
import com.skillbridge.services.StudentService;

@RestController
@RequestMapping("/api/skill-gap")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class SkillGapController {

    private final SkillGapService skillGapService;
    private final StudentService studentService;

    public SkillGapController(
            SkillGapService skillGapService,
            StudentService studentService) {
        this.skillGapService = skillGapService;
        this.studentService = studentService;
    }

    @GetMapping("/analyze")
    public ResponseEntity<?> analyze(Authentication auth) {

        boolean isStudent = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));

        if (!isStudent) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can analyze their skill gaps.");
        }

        Student student =
                studentService.getStudentByUserEmail(auth.getName());

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student profile not found.");
        }

        Map<String, Object> result = skillGapService.analyze(
                student.getCareerGoal(),
                student.getId());

        return ResponseEntity.ok(result);
    }
}
