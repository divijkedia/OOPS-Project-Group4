package com.iitsm.service;

import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.event.SlaApproachingEvent;
import com.iitsm.domain.event.SlaViolatedEvent;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.SlaTracking;
import com.iitsm.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Background daemon service for automated Service Level Agreement (SLA) compliance tracking.
 * Periodically evaluates active incidents against response and resolution deadlines.
 * Fires domain events (SlaApproachingEvent, SlaViolatedEvent) when thresholds are breached.
 */
@Service
public class SlaMonitorService {

    private static final Logger log = LoggerFactory.getLogger(SlaMonitorService.class);
    private static final double WARNING_THRESHOLD_RATIO = 0.80; // 80% of SLA time window elapsed

    private final IncidentRepository incidentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final com.iitsm.intelligence.AutoEscalationService autoEscalationService;

    @org.springframework.beans.factory.annotation.Autowired
    public SlaMonitorService(IncidentRepository incidentRepository,
                             ApplicationEventPublisher eventPublisher,
                             com.iitsm.intelligence.AutoEscalationService autoEscalationService) {
        this.incidentRepository = incidentRepository;
        this.eventPublisher = eventPublisher;
        this.autoEscalationService = autoEscalationService;
    }

    public SlaMonitorService(IncidentRepository incidentRepository,
                             ApplicationEventPublisher eventPublisher) {
        this(incidentRepository, eventPublisher, null);
    }

    /**
     * Scheduled background task executing every 60 seconds to scan active incidents.
     */
    @Scheduled(fixedRate = 60000)
    public void runScheduledSlaCheck() {
        log.debug("Executing scheduled SLA deadline verification check...");
        int updated = checkSlaDeadlines(LocalDateTime.now());
        int escalated = 0;
        if (autoEscalationService != null) {
            escalated = autoEscalationService.evaluateAndEscalate();
        }
        if (updated > 0 || escalated > 0) {
            log.info("SLA monitoring & auto-escalation run completed. {} incidents updated, {} escalated.", updated, escalated);
        }
    }

    /**
     * Evaluates compliance of all non-closed incidents against the given reference time.
     * Public method exposed for direct execution and deterministic unit testing.
     *
     * @param now the current reference timestamp
     * @return count of incidents whose SLA status or breach flags were updated
     */
    @Transactional
    public int checkSlaDeadlines(LocalDateTime now) {
        List<Incident> activeIncidents = incidentRepository.findByStatusNotIn(List.of(IncidentStatus.CLOSED));
        int updatedCount = 0;

        for (Incident incident : activeIncidents) {
            boolean modified = evaluateIncidentSla(incident, now);
            if (modified) {
                incidentRepository.save(incident);
                updatedCount++;
            }
        }

        return updatedCount;
    }

    /**
     * Convenient overload using current system clock.
     */
    @Transactional
    public int checkSlaDeadlines() {
        return checkSlaDeadlines(LocalDateTime.now());
    }

    private boolean evaluateIncidentSla(Incident incident, LocalDateTime now) {
        SlaTracking sla = incident.getSlaTracking();
        if (sla == null) {
            return false;
        }

        boolean changed = false;
        LocalDateTime createdAt = incident.getCreatedAt();

        // 1. Evaluate Response SLA
        if (sla.getRespondedAt() == null && sla.getResponseDeadline() != null) {
            if (now.isAfter(sla.getResponseDeadline())) {
                if (!sla.isResponseBreached()) {
                    sla.recordResponse(now); // Marks response breached
                    sla.setSlaStatus(SlaStatus.VIOLATED);
                    eventPublisher.publishEvent(new SlaViolatedEvent(incident.getId(), "RESPONSE", sla.getResponseDeadline()));
                    changed = true;
                }
            } else if (sla.getSlaStatus() == SlaStatus.ON_TRACK && createdAt != null) {
                Duration totalWindow = Duration.between(createdAt, sla.getResponseDeadline());
                Duration elapsed = Duration.between(createdAt, now);
                if (!totalWindow.isZero() && !totalWindow.isNegative()) {
                    double ratio = (double) elapsed.toMillis() / totalWindow.toMillis();
                    if (ratio >= WARNING_THRESHOLD_RATIO) {
                        sla.setSlaStatus(SlaStatus.APPROACHING);
                        long remaining = Duration.between(now, sla.getResponseDeadline()).toMinutes();
                        eventPublisher.publishEvent(new SlaApproachingEvent(incident.getId(), sla.getResponseDeadline(), Math.max(0, remaining)));
                        changed = true;
                    }
                }
            }
        }

        // 2. Evaluate Resolution SLA
        if (sla.getResolvedAt() == null && sla.getResolutionDeadline() != null) {
            if (now.isAfter(sla.getResolutionDeadline())) {
                if (!sla.isResolutionBreached()) {
                    sla.recordResolution(now); // Marks resolution breached
                    sla.setSlaStatus(SlaStatus.VIOLATED);
                    eventPublisher.publishEvent(new SlaViolatedEvent(incident.getId(), "RESOLUTION", sla.getResolutionDeadline()));
                    changed = true;
                }
            } else if (sla.getSlaStatus() == SlaStatus.ON_TRACK && createdAt != null) {
                Duration totalWindow = Duration.between(createdAt, sla.getResolutionDeadline());
                Duration elapsed = Duration.between(createdAt, now);
                if (!totalWindow.isZero() && !totalWindow.isNegative()) {
                    double ratio = (double) elapsed.toMillis() / totalWindow.toMillis();
                    if (ratio >= WARNING_THRESHOLD_RATIO) {
                        sla.setSlaStatus(SlaStatus.APPROACHING);
                        long remaining = Duration.between(now, sla.getResolutionDeadline()).toMinutes();
                        eventPublisher.publishEvent(new SlaApproachingEvent(incident.getId(), sla.getResolutionDeadline(), Math.max(0, remaining)));
                        changed = true;
                    }
                }
            }
        }

        return changed;
    }
}
