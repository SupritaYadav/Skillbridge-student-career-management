
package com.skillbridge.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillbridge.entity.Certification;
import com.skillbridge.repository.CertificationRepository;

@Service
public class CertificationService {

    private final CertificationRepository certificationRepository;

    public CertificationService(
            CertificationRepository certificationRepository) {
        this.certificationRepository = certificationRepository;
    }

    public Certification addCertification(Certification certification) {
        return certificationRepository.save(certification);
    }

    public List<Certification> getAllCertifications() {
        return certificationRepository.findAll();
    }

    public List<Certification> getCertificationsByStudentId(Long studentId) {
        return certificationRepository.findByStudent_Id(studentId);
    }

    public Certification getCertificationById(Long id) {
        return certificationRepository.findById(id).orElse(null);
    }

    public Certification updateCertification(
            Long id, Certification certification) {

        Certification existing = getCertificationById(id);

        if (existing == null) {
            return null;
        }

        existing.setName(certification.getName());
        existing.setOrganization(certification.getOrganization());
        existing.setDate(certification.getDate());
        existing.setLink(certification.getLink());

        return certificationRepository.save(existing);
    }

    public boolean deleteCertification(Long id) {
        if (!certificationRepository.existsById(id)) {
            return false;
        }

        certificationRepository.deleteById(id);
        return true;
    }
}
