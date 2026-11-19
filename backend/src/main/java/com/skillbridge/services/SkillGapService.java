
package com.skillbridge.services;

import com.skillbridge.entity.Skill;
import com.skillbridge.repository.SkillRepository;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SkillGapService {

    private final SkillRepository skillRepository;

    public SkillGapService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    private Map<String, List<String>> getRoleSkills() {

        Map<String, List<String>> roles = new HashMap<>();

        roles.put("Full Stack Java Developer",
                Arrays.asList("Java", "SQL", "HTML", "CSS",
                        "JavaScript", "React", "Spring Boot",
                        "REST API", "Git"));

        roles.put("Java Backend Developer",
                Arrays.asList("Java", "OOP", "SQL",
                        "Spring Boot", "REST API", "Git"));

        roles.put("Frontend Developer",
                Arrays.asList("HTML", "CSS", "JavaScript",
                        "React", "Git"));

        return roles;
    }

    public Map<String, Object> analyze(String careerGoal) {
        return buildAnalysis(careerGoal, skillRepository.findAll());
    }

    public Map<String, Object> analyze(
            String careerGoal, Long studentId) {

        return buildAnalysis(
                careerGoal,
                skillRepository.findByStudent_Id(studentId));
    }

    private Map<String, Object> buildAnalysis(
            String careerGoal, List<Skill> skills) {

        Map<String, List<String>> roles = getRoleSkills();

        List<String> required = roles.getOrDefault(
                careerGoal,
                roles.get("Full Stack Java Developer"));

        Set<String> userSkills = new HashSet<>();

        for (Skill skill : skills) {
            if (skill.getSkillName() != null) {
                userSkills.add(
                        skill.getSkillName().trim().toLowerCase());
            }
        }

        List<String> missing = new ArrayList<>();

        for (String skill : required) {
            if (!userSkills.contains(skill.toLowerCase())) {
                missing.add(skill);
            }
        }

        Map<String, Object> result = new HashMap<>();

        result.put("careerGoal", careerGoal);
        result.put("requiredSkills", required);
        result.put("missingSkills", missing);

        return result;
    }
}
