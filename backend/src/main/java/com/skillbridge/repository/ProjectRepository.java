
package com.skillbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStudent_Id(Long studentId);

}
