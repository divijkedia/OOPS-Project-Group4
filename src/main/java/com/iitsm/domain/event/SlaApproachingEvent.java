package com.iitsm.domain.event;

import java.time.LocalDateTime;

/**
 * Fired when an active incident reaches 80% of its response or resolution SLA window.
 */
public record SlaApproachingEvent(
        Long incidentId,
        LocalDateTime deadline,
        long minutesRemaining,
        LocalDateTime occurredAt
) implements DomainEvent {

    public SlaApproachingEvent(Long incidentId, LocalDateTime deadline, long minutesRemaining) {
        this(incidentId, deadline, minutesRemaining, LocalDateTime.now());
    }
}
