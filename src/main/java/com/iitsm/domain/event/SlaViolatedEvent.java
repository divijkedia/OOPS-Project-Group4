package com.iitsm.domain.event;

import java.time.LocalDateTime;

/**
 * Fired when an incident breaches its response or resolution deadline.
 */
public record SlaViolatedEvent(
        Long incidentId,
        String breachType, // "RESPONSE" or "RESOLUTION"
        LocalDateTime deadline,
        LocalDateTime breachedAt,
        LocalDateTime occurredAt
) implements DomainEvent {

    public SlaViolatedEvent(Long incidentId, String breachType, LocalDateTime deadline) {
        this(incidentId, breachType, deadline, LocalDateTime.now(), LocalDateTime.now());
    }
}
