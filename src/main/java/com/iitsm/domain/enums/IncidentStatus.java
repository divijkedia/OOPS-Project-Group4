package com.iitsm.domain.enums;

/**
 * Formal stages of the incident lifecycle defined by the ITIL / ITSM specification:
 * NEW -> CLASSIFIED -> ASSIGNED -> ACKNOWLEDGED -> IN_PROGRESS -> RESOLVED -> VERIFIED -> CLOSED,
 * with supported REOPENED loops.
 */
public enum IncidentStatus {
    NEW,
    CLASSIFIED,
    ASSIGNED,
    ACKNOWLEDGED,
    IN_PROGRESS,
    RESOLVED,
    VERIFIED,
    CLOSED,
    REOPENED;

    public boolean isTerminal() {
        return this == CLOSED;
    }

    public boolean isOpen() {
        return this != RESOLVED && this != VERIFIED && this != CLOSED;
    }
}
