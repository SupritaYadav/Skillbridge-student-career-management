package com.skillbridge.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillbridge.entity.Resource;
import com.skillbridge.repository.ResourceRepository;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    // Add Resource
    public Resource addResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    // Get All Resources
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // Get Resource By ID
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id).orElse(null);
    }

    // Update Resource
    public Resource updateResource(Long id, Resource resource) {

        Resource existing = getResourceById(id);

        if (existing == null) {
            return null;
        }

        existing.setIcon(resource.getIcon());
        existing.setTitle(resource.getTitle());
        existing.setType(resource.getType());
        existing.setCategory(resource.getCategory());
        existing.setLevel(resource.getLevel());

        return resourceRepository.save(existing);
    }

    // Delete Resource
    public boolean deleteResource(Long id) {

        if (!resourceRepository.existsById(id)) {
            return false;
        }

        resourceRepository.deleteById(id);
        return true;
    }
}