package com.iitsm.domain.enums;

/**
 * Quantifies the importance of the affected IT service to the organization's mission.
 */
public enum BusinessCriticality {
    LOW(1, "Internal non-essential tools (e.g. social chat)"),
    MEDIUM(2, "Departmental support systems (e.g. internal file share)"),
    HIGH(3, "Key enterprise services (e.g. email, primary database)"),
    CRITICAL(4, "Core revenue and mission-critical systems (e.g. payment gateway, SSO)");

    private final int weight;
    private final String description;

    BusinessCriticality(int weight, String description) {
        this.weight = weight;
        this.description = description;
    }

    public int getWeight() {
        return weight;
    }

    public String getDescription() {
        return description;
    }

    @com.fasterxml.jackson.annotation.JsonCreator
    public static BusinessCriticality fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return switch (value.trim().toUpperCase()) {
            case "CRITICAL", "MISSION_CRITICAL" -> CRITICAL;
            case "HIGH", "BUSINESS_OPERATIONAL" -> HIGH;
            case "MEDIUM", "DEPARTMENTAL" -> MEDIUM;
            case "LOW", "ADMINISTRATIVE_SUPPORT", "SUPPORT" -> LOW;
            default -> valueOf(value.trim().toUpperCase());
        };
    }
}
