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

    public Map<String, Object> analyze(String careerGoal) {

        Map<String, List<String>> roles = new HashMap<>();

        roles.put("Full Stack Java Developer",
                Arrays.asList("Java", "SQL", "HTML", "CSS",
                        "JavaScript", "React", "Spring Boot", "REST API", "Git"));

        roles.put("Java Backend Developer",
                Arrays.asList("Java", "OOP", "SQL",
                        "Spring Boot", "REST API", "Git"));

        roles.put("Frontend Developer",
                Arrays.asList("HTML", "CSS", "JavaScript", "React", "Git"));

        List<String> required = roles.getOrDefault(
                careerGoal,
                roles.get("Full Stack Java Developer")
        );

        List<Skill> skills = skillRepository.findAll();

        Set<String> userSkills = new HashSet<>();

        for (Skill skill : skills) {
            userSkills.add(skill.getSkillName().toLowerCase());
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
