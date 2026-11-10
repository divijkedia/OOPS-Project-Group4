package com.iitsm.intelligence;

import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.Technician;
import com.iitsm.repository.IncidentRepository;
import com.iitsm.repository.TechnicianRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * Intelligent Feature 2: Multi-Factor Smart Technician Recommendation Engine.
 * Evaluates candidate technicians across four weighted operational dimensions:
 * 1. Skill Relevance (40%)
 * 2. Capacity & Workload Headroom (25%)
 * 3. Seniority & Experience Level (20%)
 * 4. IT Service Familiarity & Resolution History (15%)
 */
@Component
@Transactional(readOnly = true)
public class SmartTechnicianRecommender {

    private final TechnicianRepository technicianRepository;
    private final IncidentRepository incidentRepository;

    public SmartTechnicianRecommender(TechnicianRepository technicianRepository,
                                      IncidentRepository incidentRepository) {
        this.technicianRepository = technicianRepository;
        this.incidentRepository = incidentRepository;
    }

    /**
     * Generates a ranked list of technician recommendations for a given incident.
     *
     * @param incident the target incident requiring assignment
     * @return list of technician recommendations ordered by composite match score descending
     */
    public List<TechnicianRecommendation> recommendTechnicians(Incident incident) {
        if (incident == null) {
            return List.of();
        }

        List<Technician> candidates = technicianRepository.findByActiveTrueAndAvailableTrue();
        List<TechnicianRecommendation> recommendations = new ArrayList<>();

        for (Technician tech : candidates) {
            // Only consider technicians with spare workload capacity
            if (tech.getActiveIncidentCount() >= tech.getMaxWorkload()) {
                continue;
            }

            double skillScore = calculateSkillScore(tech, incident.getCategory());
            double capacityScore = calculateCapacityScore(tech);
            double experienceScore = calculateExperienceScore(tech.getExperienceLevel());
            double serviceHistoryScore = calculateServiceHistoryScore(tech, incident);

            double totalScore = skillScore + capacityScore + experienceScore + serviceHistoryScore;
            totalScore = Math.round(totalScore * 10.0) / 10.0;

            String explanation = String.format(
                    "Score %.1f [Skills: %.1f/40, Capacity: %.1f/25, Exp: %.1f/20, History: %.1f/15]",
                    totalScore, skillScore, capacityScore, experienceScore, serviceHistoryScore
            );

            recommendations.add(new TechnicianRecommendation(
                    tech.getId(),
                    tech.getFullName(),
                    tech.getExperienceLevel(),
                    tech.getActiveIncidentCount(),
                    tech.getMaxWorkload(),
                    totalScore,
                    skillScore,
                    capacityScore,
                    experienceScore,
                    serviceHistoryScore,
                    explanation
            ));
        }

        recommendations.sort(Comparator.comparingDouble(TechnicianRecommendation::matchScore).reversed());
        return recommendations;
    }

    private double calculateSkillScore(Technician tech, IncidentCategory category) {
        if (category == null || tech.getSkills().isEmpty()) {
            return 5.0; // Baseline
        }

        String catName = category.getName().toLowerCase();
        Set<String> skills = tech.getSkills();

        // Direct category name match
        for (String skill : skills) {
            if (skill.equalsIgnoreCase(catName)) {
                return 40.0;
            }
        }

        // Secondary keyword token match
        List<String> tokens = category.getKeywordTokens();
        for (String skill : skills) {
            if (tokens.contains(skill.toLowerCase())) {
                return 25.0;
            }
        }

        return 5.0;
    }

    private double calculateCapacityScore(Technician tech) {
        if (tech.getMaxWorkload() <= 0) {
            return 0.0;
        }
        int availableSlots = Math.max(0, tech.getMaxWorkload() - tech.getActiveIncidentCount());
        double ratio = (double) availableSlots / tech.getMaxWorkload();
        return Math.round(ratio * 25.0 * 10.0) / 10.0;
    }

    private double calculateExperienceScore(ExperienceLevel level) {
        if (level == null) {
            return 5.0;
        }
        return switch (level) {
            case EXPERT -> 20.0;
            case SENIOR -> 15.0;
            case MID -> 10.0;
            case JUNIOR -> 5.0;
        };
    }

    private double calculateServiceHistoryScore(Technician tech, Incident incident) {
        if (incident.getAffectedService() == null) {
            return 5.0;
        }

        // Check assigned history for this service
        long serviceCount = incidentRepository.findAll().stream()
                .filter(i -> i.getAssignedTechnician() != null &&
                        i.getAssignedTechnician().getId().equals(tech.getId()))
                .filter(i -> i.getAffectedService() != null &&
                        i.getAffectedService().getId().equals(incident.getAffectedService().getId()))
                .count();

        double ratio = Math.min(1.0, serviceCount / 3.0);
        return Math.round((5.0 + ratio * 10.0) * 10.0) / 10.0;
    }
}
