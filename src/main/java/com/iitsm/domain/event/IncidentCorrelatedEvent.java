package com.iitsm.domain.event;

import java.time.LocalDateTime;

/**
 * Domain Event published when an incident is automatically or manually correlated
 * with another incident based on shared services, infrastructure dependencies,
 * temporal proximity, or failure symptom patterns.
 */
public record IncidentCorrelatedEvent(
        Long incidentId,
        Long correlatedIncidentId,
        String correlationType,
        double correlationScore,
        String sharedComponent,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentCorrelatedEvent(Long incidentId, Long correlatedIncidentId, String correlationType, double correlationScore, String sharedComponent) {
        this(incidentId, correlatedIncidentId, correlationType, correlationScore, sharedComponent, LocalDateTime.now());
    }
}
