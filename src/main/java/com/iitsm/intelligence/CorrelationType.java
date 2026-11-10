package com.iitsm.intelligence;

/**
 * Categorization of the primary relationship vector that links two correlated incidents.
 */
public enum CorrelationType {
    SHARED_SERVICE("Shared IT Service", "Incidents affecting the exact same business or technical service"),
    INFRASTRUCTURE_DEPENDENCY("Infrastructure Dependency", "Incidents across services that share upstream architectural dependencies (e.g., Database, Authentication SSO)"),
    TEMPORAL_SPIKE("Temporal Proximity", "Multiple outages occurring concurrently within a short sliding time window"),
    SYMPTOM_PATTERN("Symptom & Failure Pattern", "Shared systemic failure symptoms (e.g., timeout, connection refused, deadlock, 500 error)");

    private final String displayName;
    private final String description;

    CorrelationType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
