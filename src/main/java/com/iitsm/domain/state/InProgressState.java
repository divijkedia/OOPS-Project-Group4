package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing active diagnostic work and investigation in progress.
 */
public final class InProgressState implements IncidentState {

    public static final InProgressState INSTANCE = new InProgressState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(
            IncidentStatus.RESOLVED,
            IncidentStatus.ASSIGNED,
            IncidentStatus.CLASSIFIED,
            IncidentStatus.NEW
    );

    private InProgressState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.IN_PROGRESS;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
