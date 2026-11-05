package com.iitsm.domain.enums;

/**
 * Assesses the scope of damage or disruption caused by an incident.
 * Weight is used in priority calculations.
 */
public enum Impact {
    LOW(1, "Affects a single user or non-essential feature"),
    MEDIUM(2, "Affects a small team or non-critical business workflow"),
    HIGH(3, "Affects an entire department or significant business capability"),
    CRITICAL(4, "Affects the entire organization or external customers");

    private final int weight;
    private final String description;

    Impact(int weight, String description) {
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
