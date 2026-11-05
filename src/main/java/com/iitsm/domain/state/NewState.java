package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing a newly reported incident awaiting initial triage and classification.
 */
public final class NewState implements IncidentState {

    public static final NewState INSTANCE = new NewState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(IncidentStatus.CLASSIFIED);

    private NewState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.NEW;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
