package com.iitsm.domain.event;

import com.iitsm.domain.enums.Priority;

import java.time.LocalDateTime;

/**
 * Fired when a new incident is created and logged in the system.
 */
public record IncidentCreatedEvent(
        Long incidentId,
        String title,
        Long reporterId,
        Long serviceId,
        Priority priority,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentCreatedEvent(Long incidentId, String title, Long reporterId, Long serviceId, Priority priority) {
        this(incidentId, title, reporterId, serviceId, priority, LocalDateTime.now());
    }
}
