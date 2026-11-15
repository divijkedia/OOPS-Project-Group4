package com.iitsm.service;

import com.iitsm.domain.enums.NotificationChannel;
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
import com.iitsm.domain.model.Administrator;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.observer.IncidentObserver;
import com.iitsm.repository.AdministratorRepository;
import com.iitsm.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Observer Pattern: Event listener that translates domain events into multi-channel notifications
 * (In-App alerts and simulated Email dispatches) for relevant stakeholders.
 * Keeps notification dispatch fully decoupled from domain entities and persistence logic.
 */
@Component
public class NotificationEventListener implements IncidentObserver {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;
    private final IncidentRepository incidentRepository;
    private final AdministratorRepository administratorRepository;

    public NotificationEventListener(NotificationService notificationService,
                                     IncidentRepository incidentRepository,
                                     AdministratorRepository administratorRepository) {
        this.notificationService = notificationService;
        this.incidentRepository = incidentRepository;
        this.administratorRepository = administratorRepository;
    }

    @EventListener
    public void onIncidentCreated(IncidentCreatedEvent event) {
        dispatchMultiChannelAlert(
                event.reporterId(),
                "INCIDENT_CREATED",
                "Incident Logged: INC-" + event.incidentId(),
                String.format("Your incident '%s' has been registered with priority %s.", event.title(), event.priority()),
                event.incidentId()
        );
    }

    @EventListener
    public void onIncidentAssigned(IncidentAssignedEvent event) {
        dispatchMultiChannelAlert(
                event.technicianId(),
                "INCIDENT_ASSIGNED",
                "New Assignment: INC-" + event.incidentId(),
                String.format("You have been assigned to Incident INC-%d using %s assignment strategy.",
                        event.incidentId(), event.strategyUsed()),
                event.incidentId()
        );
    }

    @EventListener
    public void onIncidentUnassigned(IncidentUnassignedEvent event) {
        dispatchMultiChannelAlert(
                event.technicianId(),
                "INCIDENT_UNASSIGNED",
                "Unassigned: INC-" + event.incidentId(),
                String.format("You have been unassigned from Incident INC-%d.", event.incidentId()),
                event.incidentId()
        );
    }

    @EventListener
    public void onIncidentStatusChanged(IncidentStatusChangedEvent event) {
        incidentRepository.findById(event.incidentId()).ifPresent(incident -> {
            if (incident.getReporter() != null) {
                dispatchMultiChannelAlert(
                        incident.getReporter().getId(),
                        "STATUS_CHANGED",
                        "Incident Update: INC-" + incident.getId(),
                        String.format("Incident status updated to %s.", event.newStatus()),
                        incident.getId()
                );
            }
        });
    }

    @EventListener
    public void onSlaApproaching(SlaApproachingEvent event) {
        incidentRepository.findById(event.incidentId()).ifPresent(incident -> {
            String message = String.format("WARNING: Incident INC-%d has only %d minutes remaining before SLA breach!",
                    incident.getId(), event.minutesRemaining());

            if (incident.getAssignedTechnician() != null) {
                dispatchMultiChannelAlert(
                        incident.getAssignedTechnician().getId(),
                        "SLA_APPROACHING",
                        "SLA Warning: INC-" + incident.getId(),
                        message,
                        incident.getId()
                );
            } else {
                // If unassigned, alert all administrators
                notifyAllAdministrators("SLA_APPROACHING", "Unassigned SLA Warning: INC-" + incident.getId(), message, incident.getId());
            }
        });
    }

    @EventListener
    public void onSlaViolated(SlaViolatedEvent event) {
        incidentRepository.findById(event.incidentId()).ifPresent(incident -> {
            String message = String.format("CRITICAL: Incident INC-%d breached its %s deadline at %s!",
                    incident.getId(), event.breachType(), event.deadline());

            if (incident.getAssignedTechnician() != null) {
                dispatchMultiChannelAlert(
                        incident.getAssignedTechnician().getId(),
                        "SLA_VIOLATED",
                        "SLA Breach: INC-" + incident.getId(),
                        message,
                        incident.getId()
                );
            }

            // Always notify system administrators of breaches
            notifyAllAdministrators("SLA_VIOLATED", "Critical SLA Breach: INC-" + incident.getId(), message, incident.getId());
        });
    }

    @EventListener
    public void onIncidentResolved(IncidentResolvedEvent event) {
        incidentRepository.findById(event.incidentId()).ifPresent(incident -> {
            if (incident.getReporter() != null) {
                dispatchMultiChannelAlert(
                        incident.getReporter().getId(),
                        "INCIDENT_RESOLVED",
                        "Incident Resolved: INC-" + incident.getId(),
                        String.format("Your incident has been resolved: '%s'. Please verify and provide feedback.", event.summary()),
                        incident.getId()
                );
            }
        });
    }

    @EventListener
    public void onIncidentClosed(IncidentClosedEvent event) {
        incidentRepository.findById(event.incidentId()).ifPresent(incident -> {
            if (incident.getReporter() != null) {
                dispatchMultiChannelAlert(
                        incident.getReporter().getId(),
                        "INCIDENT_CLOSED",
                        "Incident Closed: INC-" + incident.getId(),
                        "Your incident ticket has been verified and permanently closed.",
                        incident.getId()
                );
            }
        });
    }

    @EventListener
    public void onIncidentEscalated(IncidentEscalatedEvent event) {
        incidentRepository.findById(event.incidentId()).ifPresent(incident -> {
            String title = "OPERATIONAL ESCALATION: INC-" + event.incidentId();
            String message = String.format("CRITICAL ALERT: Incident INC-%d escalated to %s. Priority: %s. Reason: %s",
                    event.incidentId(), event.newLevel().getLabel(), event.currentPriority(), event.reason());

            if (incident.getAssignedTechnician() != null) {
                dispatchMultiChannelAlert(
                        incident.getAssignedTechnician().getId(),
                        "INCIDENT_ESCALATED",
                        title,
                        message,
                        incident.getId()
                );
            }

            if (incident.getReporter() != null) {
                dispatchMultiChannelAlert(
                        incident.getReporter().getId(),
                        "INCIDENT_ESCALATED",
                        "Incident Status Update: INC-" + incident.getId(),
                        "Your ticket has been escalated to " + event.newLevel().getLabel() + " for priority resolution.",
                        incident.getId()
                );
            }

            notifyAllAdministrators("INCIDENT_ESCALATED", title, message, incident.getId());
        });
    }

    @Override
    public void onIncidentEvent(Incident incident, DomainEvent event) {
        if (event instanceof IncidentCreatedEvent e) onIncidentCreated(e);
        else if (event instanceof IncidentAssignedEvent e) onIncidentAssigned(e);
        else if (event instanceof IncidentUnassignedEvent e) onIncidentUnassigned(e);
        else if (event instanceof IncidentStatusChangedEvent e) onIncidentStatusChanged(e);
        else if (event instanceof IncidentResolvedEvent e) onIncidentResolved(e);
        else if (event instanceof IncidentClosedEvent e) onIncidentClosed(e);
        else if (event instanceof SlaApproachingEvent e) onSlaApproaching(e);
        else if (event instanceof SlaViolatedEvent e) onSlaViolated(e);
        else if (event instanceof IncidentEscalatedEvent e) onIncidentEscalated(e);
    }

    @Override
    public String getObserverName() {
        return "NotificationIncidentObserver";
    }

    private void dispatchMultiChannelAlert(Long recipientId, String type, String title, String message, Long incidentId) {
        if (recipientId == null) {
            return;
        }
        try {
            notificationService.notifyUser(recipientId, type, title, message, NotificationChannel.IN_APP, incidentId);
            notificationService.notifyUser(recipientId, type, title, message, NotificationChannel.EMAIL, incidentId);
        } catch (Exception e) {
            log.error("Failed to dispatch multi-channel notification to user {}: {}", recipientId, e.getMessage());
        }
    }

    private void notifyAllAdministrators(String type, String title, String message, Long incidentId) {
        List<Administrator> admins = administratorRepository.findAll();
        for (Administrator admin : admins) {
            dispatchMultiChannelAlert(admin.getId(), type, title, message, incidentId);
        }
    }
}
