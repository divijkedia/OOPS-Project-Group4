package com.iitsm.service;

import com.iitsm.domain.enums.AuditAction;
import com.iitsm.domain.event.DomainEvent;
import com.iitsm.domain.event.IncidentAssignedEvent;
import com.iitsm.domain.event.IncidentClosedEvent;
import com.iitsm.domain.event.IncidentCreatedEvent;
import com.iitsm.domain.event.IncidentEscalatedEvent;
import com.iitsm.domain.event.IncidentPriorityChangedEvent;
import com.iitsm.domain.event.IncidentResolvedEvent;
import com.iitsm.domain.event.IncidentStatusChangedEvent;
import com.iitsm.domain.event.IncidentUnassignedEvent;
import com.iitsm.domain.event.SlaApproachingEvent;
import com.iitsm.domain.event.SlaViolatedEvent;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.observer.IncidentObserver;
import com.iitsm.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Observer Pattern: Event listener that records immutable audit trail entries
 * whenever domain events are fired across the incident lifecycle.
 * Completely decouples audit persistence from core domain entities and state transitions.
 */
@Component
public class AuditEventListener implements IncidentObserver {

    private static final Logger log = LoggerFactory.getLogger(AuditEventListener.class);

    private final AuditService auditService;
    private final UserRepository userRepository;

    public AuditEventListener(AuditService auditService, UserRepository userRepository) {
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @EventListener
    public void onIncidentCreated(IncidentCreatedEvent event) {
        String username = resolveUsername(event.reporterId());
        auditService.recordAction(
                event.reporterId(),
                username,
                AuditAction.CREATED,
                event.incidentId(),
                null,
                "NEW",
                String.format("Incident created with priority %s for service #%d: '%s'",
                        event.priority(), event.serviceId(), event.title())
        );
        log.debug("Audit recorded: Incident #{} created by {}", event.incidentId(), username);
    }

    @EventListener
    public void onIncidentStatusChanged(IncidentStatusChangedEvent event) {
        String username = resolveUsername(event.triggeredByUserId());
        String description = String.format("Status transitioned from %s to %s%s",
                event.previousStatus(),
                event.newStatus(),
                event.reason() != null && !event.reason().isBlank() ? " (Reason: " + event.reason() + ")" : "");

        auditService.recordAction(
                event.triggeredByUserId(),
                username,
                AuditAction.STATUS_CHANGED,
                event.incidentId(),
                event.previousStatus() != null ? event.previousStatus().name() : null,
                event.newStatus().name(),
                description
        );
        log.debug("Audit recorded: Incident #{} status changed to {}", event.incidentId(), event.newStatus());
    }

    @EventListener
    public void onIncidentAssigned(IncidentAssignedEvent event) {
        auditService.recordAction(
                event.technicianId(),
                event.technicianName(),
                AuditAction.ASSIGNED,
                event.incidentId(),
                "CLASSIFIED",
                "ASSIGNED",
                String.format("Assigned to technician %s via strategy '%s'",
                        event.technicianName(), event.strategyUsed())
        );
        log.debug("Audit recorded: Incident #{} assigned to {}", event.incidentId(), event.technicianName());
    }

    @EventListener
    public void onIncidentUnassigned(IncidentUnassignedEvent event) {
        auditService.recordAction(
                event.technicianId(),
                event.technicianName(),
                AuditAction.STATUS_CHANGED,
                event.incidentId(),
                "ASSIGNED",
                "CLASSIFIED",
                String.format("Unassigned technician %s from incident INC-%d",
                        event.technicianName(), event.incidentId())
        );
        log.debug("Audit recorded: Incident #{} unassigned from technician {}", event.incidentId(), event.technicianName());
    }

    @EventListener
    public void onIncidentPriorityChanged(IncidentPriorityChangedEvent event) {
        auditService.recordAction(
                null,
                "SYSTEM",
                AuditAction.PRIORITY_SET,
                event.incidentId(),
                event.oldPriority() != null ? event.oldPriority().name() : null,
                event.newPriority().name(),
                String.format("Priority updated to %s (Score: %d). %s",
                        event.newPriority(), event.newScore(), event.rationale())
        );
        log.debug("Audit recorded: Incident #{} priority updated to {}", event.incidentId(), event.newPriority());
    }

    @EventListener
    public void onSlaApproaching(SlaApproachingEvent event) {
        auditService.recordAction(
                null,
                "SYSTEM",
                AuditAction.SLA_WARNED,
                event.incidentId(),
                "ON_TRACK",
                "APPROACHING",
                String.format("SLA WARNING: Deadline approaching at %s (%d minutes remaining)",
                        event.deadline(), event.minutesRemaining())
        );
        log.debug("Audit recorded: Incident #{} SLA approaching warning", event.incidentId());
    }

    @EventListener
    public void onSlaViolated(SlaViolatedEvent event) {
        auditService.recordAction(
                null,
                "SYSTEM",
                AuditAction.SLA_VIOLATED,
                event.incidentId(),
                "APPROACHING",
                "VIOLATED",
                String.format("SLA VIOLATION: %s deadline breached at %s",
                        event.breachType(), event.deadline())
        );
        log.debug("Audit recorded: Incident #{} SLA violated", event.incidentId());
    }

    @EventListener
    public void onIncidentResolved(IncidentResolvedEvent event) {
        String username = resolveUsername(event.resolvedByUserId());
        auditService.recordAction(
                event.resolvedByUserId(),
                username,
                AuditAction.RESOLVED,
                event.incidentId(),
                "IN_PROGRESS",
                "RESOLVED",
                String.format("Remediated and resolved: %s", event.summary())
        );
        log.debug("Audit recorded: Incident #{} resolved by {}", event.incidentId(), username);
    }

    @EventListener
    public void onIncidentClosed(IncidentClosedEvent event) {
        String username = resolveUsername(event.closedByUserId());
        auditService.recordAction(
                event.closedByUserId(),
                username,
                AuditAction.CLOSED,
                event.incidentId(),
                "VERIFIED",
                "CLOSED",
                "Incident verification completed and ticket permanently closed"
        );
        log.debug("Audit recorded: Incident #{} closed by {}", event.incidentId(), username);
    }

    @EventListener
    public void onIncidentEscalated(IncidentEscalatedEvent event) {
        auditService.recordAction(
                null,
                "SYSTEM",
                AuditAction.ESCALATED,
                event.incidentId(),
                event.previousLevel() != null ? event.previousLevel().name() : "NONE",
                event.newLevel().name(),
                String.format("Incident escalated from %s to %s. Priority: %s. Reason: %s",
                        event.previousLevel() != null ? event.previousLevel().getLabel() : "Standard Queue",
                        event.newLevel().getLabel(),
                        event.currentPriority(),
                        event.reason())
        );
        log.warn("Audit recorded: Incident #{} escalated to {}", event.incidentId(), event.newLevel());
    }

    @Override
    public void onIncidentEvent(Incident incident, DomainEvent event) {
        if (event instanceof IncidentCreatedEvent e) onIncidentCreated(e);
        else if (event instanceof IncidentStatusChangedEvent e) onIncidentStatusChanged(e);
        else if (event instanceof IncidentAssignedEvent e) onIncidentAssigned(e);
        else if (event instanceof IncidentUnassignedEvent e) onIncidentUnassigned(e);
        else if (event instanceof IncidentPriorityChangedEvent e) onIncidentPriorityChanged(e);
        else if (event instanceof IncidentResolvedEvent e) onIncidentResolved(e);
        else if (event instanceof IncidentClosedEvent e) onIncidentClosed(e);
        else if (event instanceof SlaApproachingEvent e) onSlaApproaching(e);
        else if (event instanceof SlaViolatedEvent e) onSlaViolated(e);
        else if (event instanceof IncidentEscalatedEvent e) onIncidentEscalated(e);
    }

    @Override
    public String getObserverName() {
        return "AuditIncidentObserver";
    }

    private String resolveUsername(Long userId) {
        if (userId == null) {
            return "SYSTEM";
        }
        return userRepository.findById(userId)
                .map(u -> u.getUsername())
                .orElse("user#" + userId);
    }
}
