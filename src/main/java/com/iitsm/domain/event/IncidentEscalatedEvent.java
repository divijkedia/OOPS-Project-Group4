package com.iitsm.domain.event;

import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.Priority;

import java.time.LocalDateTime;

/**
 * Domain event published when an incident is escalated across operational tiers.
 */
public record IncidentEscalatedEvent(
        Long incidentId,
        String incidentTitle,
        EscalationLevel previousLevel,
        EscalationLevel newLevel,
        Priority currentPriority,
        String reason,
        LocalDateTime occurredAt
) implements DomainEvent {

    public IncidentEscalatedEvent(Long incidentId, String incidentTitle,
                                  EscalationLevel previousLevel, EscalationLevel newLevel,
                                  Priority currentPriority, String reason) {
        this(incidentId, incidentTitle, previousLevel, newLevel, currentPriority, reason, LocalDateTime.now());
    }
}
