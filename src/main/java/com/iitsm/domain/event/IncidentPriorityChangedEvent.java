package com.iitsm.domain.event;

import com.iitsm.domain.enums.Priority;

import java.time.LocalDateTime;

/**
 * Fired when an incident's priority is recomputed or manually adjusted.
 */
public record IncidentPriorityChangedEvent(
        Long incidentId,
        Priority oldPriority,
        Priority newPriority,
        int newScore,
        String rationale,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentPriorityChangedEvent(Long incidentId, Priority oldPriority,
                                        Priority newPriority, int newScore, String rationale) {
        this(incidentId, oldPriority, newPriority, newScore, rationale, LocalDateTime.now());
    }
}
