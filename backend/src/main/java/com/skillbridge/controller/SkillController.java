
package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.Skill;
import com.skillbridge.entity.Student;
import com.skillbridge.services.SkillService;
import com.skillbridge.services.StudentService;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class SkillController {

    private final SkillService skillService;
    private final StudentService studentService;

    public SkillController(
            SkillService skillService,
            StudentService studentService) {
        this.skillService = skillService;
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

    private boolean ownsSkill(Skill skill, Student student) {
        return skill.getStudent() != null
                && student != null
                && skill.getStudent().getId().equals(student.getId());
    }

    @PostMapping
    public ResponseEntity<?> addSkill(
            @RequestBody Skill skill,
            Authentication auth) {

        if (!isStudent(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can add skills.");
        }

        Student student =
                studentService.getStudentByUserEmail(auth.getName());

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student profile not found.");
        }

        skill.setStudent(student);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(skillService.addSkill(skill));
    }

    @GetMapping
    public ResponseEntity<?> getAllSkills(Authentication auth) {

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (student == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Student profile not found.");
            }

            return ResponseEntity.ok(
                    skillService.getSkillsByStudentId(student.getId()));
        }

        if (isFacultyOrAdmin(auth)) {
            return ResponseEntity.ok(skillService.getAllSkills());
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSkillById(
            @PathVariable Long id,
            Authentication auth) {

        Skill skill = skillService.getSkillById(id);

        if (skill == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsSkill(skill, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isFacultyOrAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(skill);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSkill(
            @PathVariable Long id,
            @RequestBody Skill updatedSkill,
            Authentication auth) {

        Skill existing = skillService.getSkillById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsSkill(existing, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                skillService.updateSkill(id, updatedSkill));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSkill(
            @PathVariable Long id,
            Authentication auth) {

        Skill existing = skillService.getSkillById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsSkill(existing, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        skillService.deleteSkill(id);

        return ResponseEntity.noContent().build();
    }
}
