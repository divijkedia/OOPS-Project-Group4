package com.iitsm.domain.exception;

/**
 * Thrown when an incident cannot be assigned because a target technician
 * is marked unavailable (off-duty or on leave).
 */
public class TechnicianUnavailableException extends RuntimeException {

    private final Long technicianId;

    public TechnicianUnavailableException(Long technicianId) {
        super(String.format("Technician with ID %d is currently unavailable for assignments", technicianId));
        this.technicianId = technicianId;
    }

    public TechnicianUnavailableException(String message) {
        super(message);
        this.technicianId = null;
    }

    public Long getTechnicianId() {
        return technicianId;
    }
}
