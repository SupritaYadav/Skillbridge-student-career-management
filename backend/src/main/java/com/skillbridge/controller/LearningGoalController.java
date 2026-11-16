package com.skillbridge.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.LearningGoal;
import com.skillbridge.services.LearningGoalService;

@RestController
@RequestMapping("/api/learning-goals")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class LearningGoalController {

    private final LearningGoalService learningGoalService;

    public LearningGoalController(LearningGoalService learningGoalService) {
        this.learningGoalService = learningGoalService;
    }

    @PostMapping
    public ResponseEntity<LearningGoal> addLearningGoal(
            @RequestBody LearningGoal learningGoal) {

        LearningGoal saved = learningGoalService.addLearningGoal(learningGoal);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<LearningGoal>> getAllLearningGoals() {
        return ResponseEntity.ok(learningGoalService.getAllLearningGoals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningGoal> getLearningGoalById(@PathVariable Long id) {

        LearningGoal learningGoal = learningGoalService.getLearningGoalById(id);

        if (learningGoal == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(learningGoal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningGoal> updateLearningGoal(
            @PathVariable Long id,
            @RequestBody LearningGoal learningGoal) {

        LearningGoal updated = learningGoalService.updateLearningGoal(id, learningGoal);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningGoal(@PathVariable Long id) {

        boolean deleted = learningGoalService.deleteLearningGoal(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
