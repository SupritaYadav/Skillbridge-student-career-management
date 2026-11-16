package com.skillbridge.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.skillbridge.entity.Resource;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

}
