package com.iitsm.domain.event;

import java.time.LocalDateTime;

/**
 * Fired when a support technician is unassigned completely from an incident.
 */
public record IncidentUnassignedEvent(
        Long incidentId,
        Long technicianId,
        String technicianName,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentUnassignedEvent(Long incidentId, Long technicianId, String technicianName) {
        this(incidentId, technicianId, technicianName, LocalDateTime.now());
    }
}
