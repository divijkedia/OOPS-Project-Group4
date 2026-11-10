package com.iitsm.domain.event;

import com.iitsm.domain.enums.IncidentStatus;

import java.time.LocalDateTime;

/**
 * Fired whenever an incident transitions between lifecycle states.
 */
public record IncidentStatusChangedEvent(
        Long incidentId,
        IncidentStatus previousStatus,
        IncidentStatus newStatus,
        Long triggeredByUserId,
        String reason,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentStatusChangedEvent(Long incidentId, IncidentStatus previousStatus,
                                      IncidentStatus newStatus, Long triggeredByUserId, String reason) {
        this(incidentId, previousStatus, newStatus, triggeredByUserId, reason, LocalDateTime.now());
    }
}
