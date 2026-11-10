package com.iitsm.domain.event;

import java.time.LocalDateTime;

/**
 * Fired when an incident is formally closed after user or admin verification.
 */
public record IncidentClosedEvent(
        Long incidentId,
        Long closedByUserId,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentClosedEvent(Long incidentId, Long closedByUserId) {
        this(incidentId, closedByUserId, LocalDateTime.now());
    }
}
