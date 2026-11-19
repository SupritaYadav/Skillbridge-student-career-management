
package com.skillbridge.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillbridge.entity.Project;
import com.skillbridge.repository.ProjectRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Project addProject(Project project) {
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsByStudentId(Long studentId) {
        return projectRepository.findByStudent_Id(studentId);
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public Project updateProject(Long id, Project project) {
        Optional<Project> existing = projectRepository.findById(id);

        if (existing.isEmpty()) {
            return null;
        }

        Project current = existing.get();
        current.setTitle(project.getTitle());
        current.setDescription(project.getDescription());
        current.setTechnologies(project.getTechnologies());
        current.setLink(project.getLink());

        return projectRepository.save(current);
    }

    public boolean deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            return false;
        }

        projectRepository.deleteById(id);
        return true;
    }
}
