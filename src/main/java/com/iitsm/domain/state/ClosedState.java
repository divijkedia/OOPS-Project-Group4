package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing a formally closed incident.
 * The incident is archived from active monitoring, but may be reopened if identical symptoms reoccur.
 */
public final class ClosedState implements IncidentState {

    public static final ClosedState INSTANCE = new ClosedState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(IncidentStatus.REOPENED);

    private ClosedState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.CLOSED;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
