
package com.skillbridge.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillbridge.entity.LearningGoal;

public interface LearningGoalRepository
        extends JpaRepository<LearningGoal, Long> {

    List<LearningGoal> findByStudent_Id(Long studentId);

}
