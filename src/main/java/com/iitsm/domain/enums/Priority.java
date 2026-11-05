package com.iitsm.domain.enums;

/**
 * Standard ITIL incident priority levels derived dynamically from Impact, Urgency,
 * Business Criticality, and user impact metrics.
 */
public enum Priority {
    P1("Critical", 1),
    P2("High", 2),
    P3("Medium", 3),
    P4("Low", 4);

    private final String label;
    private final int rank;

    Priority(String label, int rank) {
        this.label = label;
        this.rank = rank;
    }

    public String getLabel() {
        return label;
    }

    public int getRank() {
        return rank;
    }

    public boolean isMoreSevereThan(Priority other) {
        return this.rank < other.rank;
    }

    @com.fasterxml.jackson.annotation.JsonCreator
    public static Priority fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return switch (value.trim().toUpperCase()) {
            case "P1", "P1_CRITICAL", "CRITICAL" -> P1;
            case "P2", "P2_HIGH", "HIGH" -> P2;
            case "P3", "P3_MEDIUM", "MEDIUM" -> P3;
            case "P4", "P4_LOW", "LOW" -> P4;
            default -> valueOf(value.trim().toUpperCase());
        };
    }
}
