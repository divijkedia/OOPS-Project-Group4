package com.iitsm.domain.event;

import java.time.LocalDateTime;

/**
 * Fired when an incident is remediated and marked RESOLVED.
 */
public record IncidentResolvedEvent(
        Long incidentId,
        Long resolvedByUserId,
        String summary,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentResolvedEvent(Long incidentId, Long resolvedByUserId, String summary) {
        this(incidentId, resolvedByUserId, summary, LocalDateTime.now());
    }
}
