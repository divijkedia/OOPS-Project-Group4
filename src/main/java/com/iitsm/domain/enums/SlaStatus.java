package com.iitsm.domain.enums;

/**
 * Compliance state of an incident's Service Level Agreement deadlines.
 */
public enum SlaStatus {
    ON_TRACK("Deadlines are safely in the future"),
    APPROACHING("Incident has elapsed 80% or more of permitted SLA window"),
    VIOLATED("Response or resolution target was breached");

    private final String description;

    SlaStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
