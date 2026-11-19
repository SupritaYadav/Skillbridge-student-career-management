
package com.skillbridge.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.LearningGoal;
import com.skillbridge.entity.Student;
import com.skillbridge.services.LearningGoalService;
import com.skillbridge.services.StudentService;

@RestController
@RequestMapping("/api/learning-goals")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class LearningGoalController {

    private final LearningGoalService learningGoalService;
    private final StudentService studentService;

    public LearningGoalController(
            LearningGoalService learningGoalService,
            StudentService studentService) {
        this.learningGoalService = learningGoalService;
        this.studentService = studentService;
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }

    private boolean isStudent(Authentication auth) {
        return hasRole(auth, "STUDENT");
    }

    private boolean isFacultyOrAdmin(Authentication auth) {
        return hasRole(auth, "FACULTY") || hasRole(auth, "ADMIN");
    }

    private boolean isAdmin(Authentication auth) {
        return hasRole(auth, "ADMIN");
    }

    private boolean ownsGoal(LearningGoal goal, Student student) {
        return goal.getStudent() != null
                && student != null
                && goal.getStudent().getId().equals(student.getId());
    }

    @PostMapping
    public ResponseEntity<?> addLearningGoal(
            @RequestBody LearningGoal learningGoal,
            Authentication auth) {

        if (!isStudent(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can add learning goals.");
        }

        Student student =
                studentService.getStudentByUserEmail(auth.getName());

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student profile not found.");
        }

        learningGoal.setStudent(student);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(learningGoalService.addLearningGoal(learningGoal));
    }

    @GetMapping
    public ResponseEntity<?> getAllLearningGoals(Authentication auth) {

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (student == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Student profile not found.");
            }

            return ResponseEntity.ok(
                    learningGoalService.getLearningGoalsByStudentId(
                            student.getId()));
        }

        if (isFacultyOrAdmin(auth)) {
            return ResponseEntity.ok(
                    learningGoalService.getAllLearningGoals());
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLearningGoalById(
            @PathVariable Long id,
            Authentication auth) {

        LearningGoal goal =
                learningGoalService.getLearningGoalById(id);

        if (goal == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsGoal(goal, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isFacultyOrAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(goal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLearningGoal(
            @PathVariable Long id,
            @RequestBody LearningGoal updatedGoal,
            Authentication auth) {

        LearningGoal existing =
                learningGoalService.getLearningGoalById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsGoal(existing, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                learningGoalService.updateLearningGoal(id, updatedGoal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearningGoal(
            @PathVariable Long id,
            Authentication auth) {

        LearningGoal existing =
                learningGoalService.getLearningGoalById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsGoal(existing, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        learningGoalService.deleteLearningGoal(id);

        return ResponseEntity.noContent().build();
    }
}
