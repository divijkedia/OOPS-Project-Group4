package com.iitsm.domain.strategy;

import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.Technician;

import java.util.List;
import java.util.Optional;

/**
 * Strategy Pattern: Defines the contract for automated technician assignment strategies.
 * Enables runtime switching between strategies (Skill-based, Load-based, Round-robin)
 * by administrators without modifying core incident orchestration.
 */
public interface AssignmentStrategy {

    /**
     * Unique identifier for this strategy (e.g., "SKILL_BASED", "LOAD_BASED", "ROUND_ROBIN").
     */
    String getName();

    /**
     * Human-readable description of how this strategy selects a technician.
     */
    String getDescription();

    /**
     * Selects the most appropriate technician from the pool of candidates.
     *
     * @param incident the incident requiring an assigned technician
     * @param candidates current pool of all technicians in the system
     * @return Optional containing the selected technician, or empty if no candidate qualifies
     */
    Optional<Technician> assign(Incident incident, List<Technician> candidates);
}
