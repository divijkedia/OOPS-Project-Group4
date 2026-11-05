package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;

import java.util.Set;

/**
 * State representing an incident that has been classified by category and service,
 * awaiting technician assignment.
 */
public final class ClassifiedState implements IncidentState {

    public static final ClassifiedState INSTANCE = new ClassifiedState();

    private static final Set<IncidentStatus> ALLOWED = Set.of(IncidentStatus.ASSIGNED);

    private ClassifiedState() {
    }

    @Override
    public IncidentStatus getStatus() {
        return IncidentStatus.CLASSIFIED;
    }

    @Override
    public Set<IncidentStatus> getAllowedTransitions() {
        return ALLOWED;
    }
}
