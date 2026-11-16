package com.skillbridge.controller;

import com.skillbridge.services.SkillGapService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/skill-gap")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    @GetMapping("/analyze")
    public Map<String, Object> analyze(
            @RequestParam String careerGoal) {

        return skillGapService.analyze(careerGoal);
    }
}
