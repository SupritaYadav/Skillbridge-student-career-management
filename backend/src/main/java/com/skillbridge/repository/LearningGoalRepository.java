package com.skillbridge.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.skillbridge.entity.LearningGoal;

public interface LearningGoalRepository extends JpaRepository<LearningGoal, Long> {

}
