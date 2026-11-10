package com.iitsm.domain.observer;

import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.event.DomainEvent;
import com.iitsm.domain.event.SlaApproachingEvent;
import com.iitsm.domain.event.SlaViolatedEvent;
import com.iitsm.domain.model.Incident;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Classic GoF Observer: Concrete observer for Service Level Agreement monitoring.
 * Observes incident state updates and SLA threshold events, logging telemetry
 * and flagging operational risks.
 */
@Component
public class SlaMonitoringIncidentObserver implements IncidentObserver {

    private static final Logger log = LoggerFactory.getLogger(SlaMonitoringIncidentObserver.class);

    @Override
    public void onIncidentEvent(Incident incident, DomainEvent event) {
        if (event instanceof SlaViolatedEvent violated) {
            log.warn("[OBSERVER: SLA_MONITOR] VIOLATION DETECTED on Incident #{}: Target breached. Resolution deadline was {}",
                    violated.incidentId(), violated.deadline());
        } else if (event instanceof SlaApproachingEvent approaching) {
            log.warn("[OBSERVER: SLA_MONITOR] APPROACHING BREACH on Incident #{}: At risk of exceeding deadline {}",
                    approaching.incidentId(), approaching.deadline());
        } else if (incident != null && incident.getSlaTracking() != null) {
            SlaStatus status = incident.getSlaTracking().getSlaStatus();
            if (status == SlaStatus.VIOLATED) {
                log.warn("[OBSERVER: SLA_MONITOR] Incident #{} mutated while in VIOLATED SLA status.", incident.getId());
            }
        }
    }

    @Override
    public String getObserverName() {
        return "SlaMonitoringIncidentObserver";
    }
}
