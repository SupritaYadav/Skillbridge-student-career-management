
package com.skillbridge.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillbridge.entity.LearningGoal;
import com.skillbridge.repository.LearningGoalRepository;

@Service
public class LearningGoalService {

    private final LearningGoalRepository learningGoalRepository;

    public LearningGoalService(
            LearningGoalRepository learningGoalRepository) {
        this.learningGoalRepository = learningGoalRepository;
    }

    public LearningGoal addLearningGoal(LearningGoal learningGoal) {
        return learningGoalRepository.save(learningGoal);
    }

    public List<LearningGoal> getAllLearningGoals() {
        return learningGoalRepository.findAll();
    }

    public List<LearningGoal> getLearningGoalsByStudentId(Long studentId) {
        return learningGoalRepository.findByStudent_Id(studentId);
    }

    public LearningGoal getLearningGoalById(Long id) {
        return learningGoalRepository.findById(id).orElse(null);
    }

    public LearningGoal updateLearningGoal(
            Long id, LearningGoal learningGoal) {

        LearningGoal existing = getLearningGoalById(id);

        if (existing == null) {
            return null;
        }

        existing.setTitle(learningGoal.getTitle());
        existing.setDescription(learningGoal.getDescription());
        existing.setTargetDate(learningGoal.getTargetDate());
        existing.setStatus(learningGoal.getStatus());

        return learningGoalRepository.save(existing);
    }

    public boolean deleteLearningGoal(Long id) {
        if (!learningGoalRepository.existsById(id)) {
            return false;
        }

        learningGoalRepository.deleteById(id);
        return true;
    }
}
