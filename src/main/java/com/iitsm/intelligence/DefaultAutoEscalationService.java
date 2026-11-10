package com.iitsm.intelligence;

import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.event.IncidentEscalatedEvent;
import com.iitsm.domain.event.IncidentPriorityChangedEvent;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.SlaTracking;
import com.iitsm.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Intelligent Feature 2: Automated Incident Escalation Engine.
 * Implements the 4-tier ITIL escalation hierarchy:
 *   Tier 1: TECHNICIAN
 *   Tier 2: TEAM_LEAD
 *   Tier 3: SYSTEM_ADMINISTRATOR
 *   Tier 4: IT_MANAGER
 *
 * Automatically triggers when:
 * 1. SLA response deadlines pass without acknowledgement (Unacknowledged P1/P2 breach)
 * 2. SLA resolution status is VIOLATED or APPROACHING without active progress
 * 3. Cascade of 2+ correlated duplicate incidents is detected on the same service
 */
@Service
public class DefaultAutoEscalationService implements AutoEscalationService {

    private static final Logger log = LoggerFactory.getLogger(DefaultAutoEscalationService.class);

    private final IncidentRepository incidentRepository;
    private final ApplicationEventPublisher eventPublisher;

    public DefaultAutoEscalationService(IncidentRepository incidentRepository,
                                        ApplicationEventPublisher eventPublisher) {
        this.incidentRepository = incidentRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public boolean shouldEscalate(Incident incident) {
        if (incident == null || incident.getStatus() == IncidentStatus.CLOSED || incident.getStatus() == IncidentStatus.RESOLVED) {
            return false;
        }

        SlaTracking sla = incident.getSlaTracking();
        if (sla != null) {
            // Rule 1: SLA resolution breached and not at highest escalation level
            if (sla.getSlaStatus() == SlaStatus.VIOLATED && incident.getEscalationLevel() != EscalationLevel.IT_MANAGER) {
                return true;
            }

            // Rule 2: SLA approaching response deadline and still unacknowledged/assigned
            if (sla.getSlaStatus() == SlaStatus.APPROACHING && incident.getStatus() == IncidentStatus.ASSIGNED) {
                return true;
            }
        }

        // Rule 3: Multiple correlated duplicate incidents (major outage cluster)
        if (incident.getRelatedIncidents() != null && incident.getRelatedIncidents().size() >= 2
                && incident.getEscalationLevel().getTier() < EscalationLevel.SYSTEM_ADMINISTRATOR.getTier()) {
            return true;
        }

        return false;
    }

    @Override
    @Transactional
    public int evaluateAndEscalate() {
        List<Incident> activeIncidents = incidentRepository.findByStatusNotIn(
                List.of(IncidentStatus.CLOSED, IncidentStatus.RESOLVED)
        );
        int escalatedCount = 0;

        for (Incident incident : activeIncidents) {
            if (shouldEscalate(incident)) {
                EscalationLevel prevLevel = incident.getEscalationLevel();
                EscalationLevel nextLevel = determineNextEscalationLevel(incident);

                // If already at nextLevel or higher, continue
                if (nextLevel.getTier() <= prevLevel.getTier()) {
                    continue;
                }

                String reason = determineEscalationReason(incident);

                // Elevate priority if lower than P1 and under heavy SLA distress or duplicate cluster
                boolean priorityBumped = false;
                Priority prevPriority = incident.getPriority();
                if ((incident.getRelatedIncidents() != null && incident.getRelatedIncidents().size() >= 2) ||
                        (incident.getSlaTracking() != null && incident.getSlaTracking().getSlaStatus() == SlaStatus.VIOLATED)) {
                    if (incident.getPriority() != Priority.P1) {
                        incident.setPriority(Priority.P1);
                        incident.setPriorityScore(Math.max(incident.getPriorityScore(), 80));
                        priorityBumped = true;
                    }
                }

                incident.escalate(nextLevel, reason);
                Incident saved = incidentRepository.save(incident);
                escalatedCount++;

                log.warn("AUTOMATIC ESCALATION: Incident #{} escalated from {} to {}. Reason: {}",
                        saved.getId(), prevLevel, nextLevel, reason);

                eventPublisher.publishEvent(new IncidentEscalatedEvent(
                        saved.getId(), saved.getTitle(), prevLevel, nextLevel, saved.getPriority(), reason
                ));

                if (priorityBumped) {
                    eventPublisher.publishEvent(new IncidentPriorityChangedEvent(
                            saved.getId(), prevPriority, Priority.P1, saved.getPriorityScore(),
                            "Automated priority elevation triggered by SLA breach / duplicate incident cascade"
                    ));
                }
            }
        }

        return escalatedCount;
    }

    @Override
    @Transactional
    public Incident escalateIncident(Long incidentId, EscalationLevel targetLevel, String reason, Long requestingUserId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        EscalationLevel prev = incident.getEscalationLevel();
        EscalationLevel levelToApply = targetLevel != null ? targetLevel : prev.next();
        String appliedReason = (reason != null && !reason.isBlank()) ? reason : "Operational escalation requested";

        incident.escalate(levelToApply, appliedReason);

        // Bump priority to P1 if escalating to System Admin or IT Manager
        boolean priorityBumped = false;
        Priority oldPriority = incident.getPriority();
        if (levelToApply.getTier() >= EscalationLevel.SYSTEM_ADMINISTRATOR.getTier() && incident.getPriority() != Priority.P1) {
            incident.setPriority(Priority.P1);
            incident.setPriorityScore(Math.max(incident.getPriorityScore(), 80));
            priorityBumped = true;
        }

        Incident saved = incidentRepository.save(incident);

        eventPublisher.publishEvent(new IncidentEscalatedEvent(
                saved.getId(), saved.getTitle(), prev, levelToApply, saved.getPriority(), appliedReason
        ));

        if (priorityBumped) {
            eventPublisher.publishEvent(new IncidentPriorityChangedEvent(
                    saved.getId(), oldPriority, Priority.P1, saved.getPriorityScore(),
                    "Priority elevated to P1 due to manual escalation to " + levelToApply.getLabel()
            ));
        }

        return saved;
    }

    @Override
    public List<String> getEscalationRecommendations(Incident incident) {
        List<String> recommendations = new ArrayList<>();
        if (incident == null) return recommendations;

        if (shouldEscalate(incident)) {
            EscalationLevel next = determineNextEscalationLevel(incident);
            recommendations.add(String.format("Recommend immediate escalation to %s.", next.getLabel()));
            if (incident.getPriority() != Priority.P1) {
                recommendations.add("Recommend elevating incident priority to P1 Critical.");
            }
        }

        if (incident.getRelatedIncidents() != null && incident.getRelatedIncidents().size() >= 2) {
            recommendations.add(String.format("Detected %d correlated duplicate incidents: Recommend infrastructure outage triage.",
                    incident.getRelatedIncidents().size()));
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Incident is currently within normal operating thresholds. No escalation required.");
        }

        return recommendations;
    }

    private EscalationLevel determineNextEscalationLevel(Incident incident) {
        EscalationLevel current = incident.getEscalationLevel();
        if (incident.getRelatedIncidents() != null && incident.getRelatedIncidents().size() >= 2) {
            return EscalationLevel.SYSTEM_ADMINISTRATOR;
        }
        if (incident.getSlaTracking() != null && incident.getSlaTracking().getSlaStatus() == SlaStatus.VIOLATED) {
            if (current.getTier() < EscalationLevel.TEAM_LEAD.getTier()) return EscalationLevel.TEAM_LEAD;
            if (current.getTier() == EscalationLevel.TEAM_LEAD.getTier()) return EscalationLevel.SYSTEM_ADMINISTRATOR;
            return EscalationLevel.IT_MANAGER;
        }
        return current.next();
    }

    private String determineEscalationReason(Incident incident) {
        if (incident.getRelatedIncidents() != null && incident.getRelatedIncidents().size() >= 2) {
            return String.format("Cluster of %d correlated incident reports on service '%s'",
                    incident.getRelatedIncidents().size() + 1,
                    incident.getAffectedService() != null ? incident.getAffectedService().getName() : "IT Service");
        }
        if (incident.getSlaTracking() != null && incident.getSlaTracking().getSlaStatus() == SlaStatus.VIOLATED) {
            return "SLA violation: Resolution deadline breached without remediation";
        }
        if (incident.getStatus() == IncidentStatus.ASSIGNED) {
            return "Unacknowledged incident: Approaching response SLA deadline";
        }
        return "SLA risk threshold exceeded: Automated operational escalation";
    }
}
