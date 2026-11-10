package com.iitsm.domain.strategy;

import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.Technician;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Strategy Pattern Implementation: Assigns the technician with matching domain skills
 * for the incident's category, prioritizing highest experience level and lowest active workload.
 */
@Component("skillBasedAssignment")
public class SkillBasedAssignment implements AssignmentStrategy {

    public static final String STRATEGY_NAME = "SKILL_BASED";

    @Override
    public String getName() {
        return STRATEGY_NAME;
    }

    @Override
    public String getDescription() {
        return "Matches technician skills to incident category, preferring higher experience and lower workload";
    }

    @Override
    public Optional<Technician> assign(Incident incident, List<Technician> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            return Optional.empty();
        }

        IncidentCategory category = incident.getCategory();
        String targetSkill = category != null ? category.getName() : null;

        return candidates.stream()
                .filter(Technician::isActive)
                .filter(Technician::canAcceptIncident)
                .filter(tech -> targetSkill == null || tech.hasSkill(targetSkill))
                .min(Comparator
                        .comparing((Technician t) -> t.getExperienceLevel().getWeight()).reversed()
                        .thenComparingInt(Technician::getActiveIncidentCount));
    }
}
