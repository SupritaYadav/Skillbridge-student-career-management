
package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.Project;
import com.skillbridge.entity.Student;
import com.skillbridge.services.ProjectService;
import com.skillbridge.services.StudentService;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class ProjectController {

    private final ProjectService projectService;
    private final StudentService studentService;

    public ProjectController(
            ProjectService projectService,
            StudentService studentService) {
        this.projectService = projectService;
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

    private boolean ownsProject(Project project, Student student) {
        return project.getStudent() != null
                && student != null
                && project.getStudent().getId().equals(student.getId());
    }

    @PostMapping
    public ResponseEntity<?> addProject(
            @RequestBody Project project,
            Authentication auth) {

        if (!isStudent(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can add projects.");
        }

        Student student =
                studentService.getStudentByUserEmail(auth.getName());

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student profile not found.");
        }

        project.setStudent(student);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addProject(project));
    }

    @GetMapping
    public ResponseEntity<?> getAllProjects(Authentication auth) {

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (student == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Student profile not found.");
            }

            return ResponseEntity.ok(
                    projectService.getProjectsByStudentId(student.getId()));
        }

        if (isFacultyOrAdmin(auth)) {
            return ResponseEntity.ok(projectService.getAllProjects());
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(
            @PathVariable Long id,
            Authentication auth) {

        Project project = projectService.getProjectById(id).orElse(null);

        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsProject(project, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isFacultyOrAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long id,
            @RequestBody Project updatedProject,
            Authentication auth) {

        Project existing =
                projectService.getProjectById(id).orElse(null);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsProject(existing, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Project result = projectService.updateProject(id, updatedProject);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Long id,
            Authentication auth) {

        Project existing =
                projectService.getProjectById(id).orElse(null);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsProject(existing, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        projectService.deleteProject(id);

        return ResponseEntity.noContent().build();
    }
}
