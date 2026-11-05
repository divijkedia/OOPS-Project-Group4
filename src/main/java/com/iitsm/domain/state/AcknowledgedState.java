package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing an incident acknowledged by the assigned engineer,
 * stopping the SLA response clock.
 */
public final class AcknowledgedState implements IncidentState {

    public static final AcknowledgedState INSTANCE = new AcknowledgedState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(
            IncidentStatus.IN_PROGRESS,
            IncidentStatus.ASSIGNED,
            IncidentStatus.CLASSIFIED,
            IncidentStatus.NEW
    );

    private AcknowledgedState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.ACKNOWLEDGED;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
