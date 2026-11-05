package com.iitsm.domain.exception;

/**
 * Thrown or referenced when duplicate incident actions are rejected or flagged.
 */
public class DuplicateIncidentException extends RuntimeException {

    private final Long existingIncidentId;

    public DuplicateIncidentException(Long existingIncidentId, String message) {
        super(message);
        this.existingIncidentId = existingIncidentId;
    }

    public DuplicateIncidentException(String message) {
        super(message);
        this.existingIncidentId = null;
    }

    public Long getExistingIncidentId() {
        return existingIncidentId;
    }
}
