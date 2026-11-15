package com.iitsm.service;

import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.exception.UserNotFoundException;
import com.iitsm.domain.model.Technician;
import com.iitsm.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Service managing support engineers, technical competencies, availability, and active incident workloads.
 */
@Service
@Transactional(readOnly = true)
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    public TechnicianService(TechnicianRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public List<Technician> getActiveTechnicians() {
        return technicianRepository.findByActiveTrue();
    }

    public List<Technician> getAvailableTechnicians() {
        return technicianRepository.findByActiveTrueAndAvailableTrue();
    }

    public List<Technician> getEligibleTechnicians() {
        return technicianRepository.findEligibleTechnicians();
    }

    public Technician getTechnicianById(Long id) {
        return technicianRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public Technician getTechnicianByUsername(String username) {
        return technicianRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    @Transactional
    public Technician updateAvailability(Long id, boolean available) {
        Technician tech = getTechnicianById(id);
        tech.setAvailable(available);
        return technicianRepository.saveAndFlush(tech);
    }

    @Transactional
    public Technician updateTechnicianProfile(Long id, ExperienceLevel level, int maxWorkload, Set<String> skills) {
        Technician tech = getTechnicianById(id);
        tech.setExperienceLevel(level);
        tech.setMaxWorkload(maxWorkload);
        tech.setSkills(skills);
        return technicianRepository.save(tech);
    }
}
