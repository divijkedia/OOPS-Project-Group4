package com.iitsm.domain.event;

import java.time.LocalDateTime;

/**
 * Fired when an incident is assigned to a primary support technician.
 */
public record IncidentAssignedEvent(
        Long incidentId,
        Long technicianId,
        String technicianName,
        String strategyUsed,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentAssignedEvent(Long incidentId, Long technicianId, String technicianName, String strategyUsed) {
        this(incidentId, technicianId, technicianName, strategyUsed, LocalDateTime.now());
    }
}
