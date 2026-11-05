package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing an incident verified by the reporting user or system administrator.
 */
public final class VerifiedState implements IncidentState {

    public static final VerifiedState INSTANCE = new VerifiedState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(
            IncidentStatus.CLOSED,
            IncidentStatus.REOPENED
    );

    private VerifiedState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.VERIFIED;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
