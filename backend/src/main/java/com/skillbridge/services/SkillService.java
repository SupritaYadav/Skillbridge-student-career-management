
package com.skillbridge.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillbridge.entity.Skill;
import com.skillbridge.repository.SkillRepository;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public Skill addSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public List<Skill> getSkillsByStudentId(Long studentId) {
        return skillRepository.findByStudent_Id(studentId);
    }

    public Skill getSkillById(Long id) {
        return skillRepository.findById(id).orElse(null);
    }

    public Skill updateSkill(Long id, Skill updatedSkill) {
        Skill existing = getSkillById(id);

        if (existing == null) {
            return null;
        }

        existing.setSkillName(updatedSkill.getSkillName());
        existing.setSkillLevel(updatedSkill.getSkillLevel());
        existing.setProgress(updatedSkill.getProgress());

        return skillRepository.save(existing);
    }

    public void deleteSkill(Long id) {
        skillRepository.deleteById(id);
    }
}
