
package com.skillbridge.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.Certification;
import com.skillbridge.entity.Student;
import com.skillbridge.services.CertificationService;
import com.skillbridge.services.StudentService;

@RestController
@RequestMapping("/api/certifications")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class CertificationController {

    private final CertificationService certificationService;
    private final StudentService studentService;

    public CertificationController(
            CertificationService certificationService,
            StudentService studentService) {
        this.certificationService = certificationService;
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

    private boolean ownsCertification(
            Certification certification, Student student) {
        return certification.getStudent() != null
                && student != null
                && certification.getStudent().getId().equals(student.getId());
    }

    @PostMapping
    public ResponseEntity<?> addCertification(
            @RequestBody Certification certification,
            Authentication auth) {

        if (!isStudent(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can add certifications.");
        }

        Student student =
                studentService.getStudentByUserEmail(auth.getName());

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student profile not found.");
        }

        certification.setStudent(student);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(certificationService.addCertification(certification));
    }

    @GetMapping
    public ResponseEntity<?> getAllCertifications(Authentication auth) {

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (student == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Student profile not found.");
            }

            return ResponseEntity.ok(
                    certificationService.getCertificationsByStudentId(
                            student.getId()));
        }

        if (isFacultyOrAdmin(auth)) {
            return ResponseEntity.ok(
                    certificationService.getAllCertifications());
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCertificationById(
            @PathVariable Long id,
            Authentication auth) {

        Certification certification =
                certificationService.getCertificationById(id);

        if (certification == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsCertification(certification, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isFacultyOrAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(certification);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCertification(
            @PathVariable Long id,
            @RequestBody Certification updatedCertification,
            Authentication auth) {

        Certification existing =
                certificationService.getCertificationById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsCertification(existing, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                certificationService.updateCertification(
                        id, updatedCertification));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCertification(
            @PathVariable Long id,
            Authentication auth) {

        Certification existing =
                certificationService.getCertificationById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (isStudent(auth)) {
            Student student =
                    studentService.getStudentByUserEmail(auth.getName());

            if (!ownsCertification(existing, student)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        certificationService.deleteCertification(id);

        return ResponseEntity.noContent().build();
    }
}
