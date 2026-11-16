package com.skillbridge.services;

import com.skillbridge.entity.Opportunity;
import com.skillbridge.repository.OpportunityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;

    public OpportunityService(OpportunityRepository opportunityRepository) {
        this.opportunityRepository = opportunityRepository;
    }

    public Opportunity addOpportunity(Opportunity opportunity) {
        return opportunityRepository.save(opportunity);
    }

    public List<Opportunity> getAllOpportunities() {
        return opportunityRepository.findAll();
    }

    public Optional<Opportunity> getOpportunityById(Long id) {
        return opportunityRepository.findById(id);
    }

    public Opportunity updateOpportunity(Long id, Opportunity updatedOpportunity) {
        return opportunityRepository.findById(id).map(opportunity -> {
            opportunity.setTitle(updatedOpportunity.getTitle());
            opportunity.setCompany(updatedOpportunity.getCompany());
            opportunity.setType(updatedOpportunity.getType());
            opportunity.setLocation(updatedOpportunity.getLocation());
            opportunity.setDescription(updatedOpportunity.getDescription());
            opportunity.setApplicationLink(updatedOpportunity.getApplicationLink());
            opportunity.setDeadline(updatedOpportunity.getDeadline());

            return opportunityRepository.save(opportunity);
        }).orElse(null);
    }

    public void deleteOpportunity(Long id) {
        opportunityRepository.deleteById(id);
    }
}
