package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing an incident assigned to a primary support technician,
 * awaiting technician acknowledgement.
 */
public final class AssignedState implements IncidentState {

    public static final AssignedState INSTANCE = new AssignedState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(
            IncidentStatus.ACKNOWLEDGED,
            IncidentStatus.CLASSIFIED,
            IncidentStatus.ASSIGNED,
            IncidentStatus.NEW
    );

    private AssignedState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.ASSIGNED;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
