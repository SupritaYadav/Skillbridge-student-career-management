
package com.skillbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.Certification;

public interface CertificationRepository
        extends JpaRepository<Certification, Long> {

    List<Certification> findByStudent_Id(Long studentId);

}
