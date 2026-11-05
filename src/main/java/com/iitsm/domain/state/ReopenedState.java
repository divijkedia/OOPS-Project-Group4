package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing an incident that was previously resolved/closed but reopened due to recurring issues.
 * Feeds back into triage and re-classification.
 */
public final class ReopenedState implements IncidentState {

    public static final ReopenedState INSTANCE = new ReopenedState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(
            IncidentStatus.CLASSIFIED,
            IncidentStatus.ASSIGNED,
            IncidentStatus.NEW
    );

    private ReopenedState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.REOPENED;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
