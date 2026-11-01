package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.Certification;
import com.skillbridge.services.CertificationService;

@RestController
@RequestMapping("/api/certifications")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5175"
})
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    // Add certification
    @PostMapping
    public ResponseEntity<Certification> addCertification(
            @RequestBody Certification certification) {

        Certification saved =
                certificationService.addCertification(certification);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Get all certifications
    @GetMapping
    public ResponseEntity<List<Certification>> getAllCertifications() {

        return ResponseEntity.ok(
                certificationService.getAllCertifications());
    }

    // Get certification by ID
    @GetMapping("/{id}")
    public ResponseEntity<Certification> getCertificationById(
            @PathVariable Long id) {

        Certification certification =
                certificationService.getCertificationById(id);

        if (certification == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(certification);
    }

    // Update certification
    @PutMapping("/{id}")
    public ResponseEntity<Certification> updateCertification(
            @PathVariable Long id,
            @RequestBody Certification certification) {

        Certification updated =
                certificationService.updateCertification(id, certification);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    // Delete certification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertification(
            @PathVariable Long id) {

        boolean deleted = certificationService.deleteCertification(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
