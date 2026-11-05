package com.iitsm.domain.exception;

/**
 * Thrown when an incident query by ID yields no result.
 */
public class IncidentNotFoundException extends RuntimeException {

    private final Long incidentId;

    public IncidentNotFoundException(Long incidentId) {
        super(String.format("Incident with ID %d not found", incidentId));
        this.incidentId = incidentId;
    }

    public IncidentNotFoundException(String message) {
        super(message);
        this.incidentId = null;
    }

    public Long getIncidentId() {
        return incidentId;
    }
}
