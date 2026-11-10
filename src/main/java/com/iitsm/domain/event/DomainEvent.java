package com.iitsm.domain.event;

import java.time.LocalDateTime;

/**
 * Observer Pattern: Sealed base interface for all asynchronous and decoupled domain events in Resolvo.
 * Events are published whenever key state transitions or SLA thresholds are reached,
 * decoupling domain logic from notification delivery and audit trail recording.
 */
public sealed interface DomainEvent permits
        IncidentCreatedEvent,
        IncidentStatusChangedEvent,
        IncidentAssignedEvent,
        IncidentUnassignedEvent,
        IncidentPriorityChangedEvent,
        SlaApproachingEvent,
        SlaViolatedEvent,
        IncidentResolvedEvent,
        IncidentClosedEvent,
        IncidentEscalatedEvent,
        IncidentCorrelatedEvent {

    /**
     * Timestamp when the domain event occurred.
     */
    LocalDateTime occurredAt();

    /**
     * ID of the associated incident.
     */
    Long incidentId();
}
