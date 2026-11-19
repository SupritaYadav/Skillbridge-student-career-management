
package com.skillbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.Skill;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByStudent_Id(Long studentId);

}
