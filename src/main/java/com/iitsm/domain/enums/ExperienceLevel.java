package com.iitsm.domain.enums;

/**
 * Seniority and capability tier of a technical support engineer.
 * Weight used by Smart Technician Recommender and assignment algorithms.
 */
public enum ExperienceLevel {
    JUNIOR(1, "Entry-level engineer (handles standard P3/P4 issues)"),
    MID(2, "Proficient engineer (handles P2/P3 independently)"),
    SENIOR(3, "Senior engineer (handles complex P1/P2 issues, architecture)"),
    EXPERT(4, "Lead specialist (expert escalations, mission-critical incidents)");

    private final int weight;
    private final String description;

    ExperienceLevel(int weight, String description) {
        this.weight = weight;
        this.description = description;
    }

    public int getWeight() {
        return weight;
    }

    public String getDescription() {
        return description;
    }
}
