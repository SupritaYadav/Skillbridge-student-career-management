package com.skillbridge.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.Certification;

public interface CertificationRepository
        extends JpaRepository<Certification, Long> {

}
