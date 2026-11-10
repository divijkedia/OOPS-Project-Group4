package com.iitsm.intelligence;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.iitsm.domain.enums.ExperienceLevel;

/**
 * Value object capturing a multi-factor technician recommendation with transparent scoring breakdown.
 */
public record TechnicianRecommendation(
        Long technicianId,
        String fullName,
        ExperienceLevel experienceLevel,
        int currentWorkload,
        int maxWorkload,
        double matchScore,
        double skillScore,
        double capacityScore,
        double experienceScore,
        double serviceHistoryScore,
        String explanation
) {

    @JsonProperty("technicianName")
    public String technicianName() {
        return fullName;
    }

    @JsonProperty("activeWorkload")
    public int activeWorkload() {
        return currentWorkload;
    }

    @JsonProperty("totalScore")
    public double totalScore() {
        return matchScore;
    }

    @JsonProperty("skillMatchScore")
    public double skillMatchScore() {
        return skillScore;
    }

    @JsonProperty("workloadScore")
    public double workloadScore() {
        return capacityScore;
    }

    @JsonProperty("reason")
    public String reason() {
        return explanation;
    }
}
