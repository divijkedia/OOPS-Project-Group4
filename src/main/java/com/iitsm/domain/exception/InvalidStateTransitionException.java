package com.iitsm.domain.exception;

import com.iitsm.domain.enums.IncidentStatus;

/**
 * Thrown when an illegal state transition is attempted on an incident
 * (e.g., transitioning directly from NEW to CLOSED without resolution).
 */
public class InvalidStateTransitionException extends RuntimeException {

    private final IncidentStatus fromStatus;
    private final IncidentStatus toStatus;

    public InvalidStateTransitionException(IncidentStatus fromStatus, IncidentStatus toStatus) {
        super(String.format("Illegal state transition attempted: %s -> %s", fromStatus, toStatus));
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
    }

    public InvalidStateTransitionException(String message) {
        super(message);
        this.fromStatus = null;
        this.toStatus = null;
    }

    public IncidentStatus getFromStatus() {
        return fromStatus;
    }

    public IncidentStatus getToStatus() {
        return toStatus;
    }
}
