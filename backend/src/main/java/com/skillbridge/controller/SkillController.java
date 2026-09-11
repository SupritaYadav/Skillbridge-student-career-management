package com.skillbridge.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.skillbridge.entity.Skill;
import com.skillbridge.services.SkillService;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "http://localhost:5173")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    // Add Skill
    @PostMapping
    public Skill addSkill(@RequestBody Skill skill) {
        return skillService.addSkill(skill);
    }

    // Get All Skills
    @GetMapping
    public List<Skill> getAllSkills() {
        return skillService.getAllSkills();
    }

    // Get Skill By ID
    @GetMapping("/{id}")
    public Skill getSkillById(@PathVariable Long id) {
        return skillService.getSkillById(id);
    }

    // Update Skill
@PutMapping("/{id}")
public Skill updateSkill(
        @PathVariable Long id,
        @RequestBody Skill skill) {

    Skill existingSkill = skillService.getSkillById(id);

    if (existingSkill == null) {
        return null;
    }

    existingSkill.setSkillName(skill.getSkillName());
    existingSkill.setSkillLevel(skill.getSkillLevel());
    existingSkill.setProgress(skill.getProgress());

    return skillService.addSkill(existingSkill);
}

    // Delete Skill
    @DeleteMapping("/{id}")
    public String deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
        return "Skill deleted successfully";
    }
}
