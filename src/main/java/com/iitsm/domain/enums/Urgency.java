package com.iitsm.domain.enums;

/**
 * Reflects how quickly the incident requires resolution based on operational time sensitivity.
 */
public enum Urgency {
    LOW(1, "Workaround is readily available, can be addressed in regular backlog"),
    MEDIUM(2, "Operational delay is tolerable for a short window"),
    HIGH(3, "Substantial degradation of active business operations"),
    CRITICAL(4, "Immediate operational halt requiring emergency intervention");

    private final int weight;
    private final String description;

    Urgency(int weight, String description) {
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
