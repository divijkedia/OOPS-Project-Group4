package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing an incident where technical remediation has been completed,
 * awaiting user confirmation or administrative verification.
 */
public final class ResolvedState implements IncidentState {

    public static final ResolvedState INSTANCE = new ResolvedState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(
            IncidentStatus.VERIFIED,
            IncidentStatus.CLOSED,
            IncidentStatus.REOPENED
    );

    private ResolvedState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.RESOLVED;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
