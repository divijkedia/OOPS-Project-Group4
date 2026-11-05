package com.iitsm.domain.state;

import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.exception.InvalidStateTransitionException;
import com.iitsm.domain.model.Incident;

import java.util.Set;

/**
 * State Pattern: Sealed interface defining the contract for each incident lifecycle state.
 * Encapsulates transition rules, invariants, and side-effects for each status,
 * strictly preventing invalid transitions (e.g., NEW -> CLOSED) in accordance with ITIL.
 */
public sealed interface IncidentState permits
        NewState,
        ClassifiedState,
        AssignedState,
        AcknowledgedState,
        InProgressState,
        ResolvedState,
        VerifiedState,
        ClosedState,
        ReopenedState {

    /**
     * Gets the incident status represented by this state.
     */
    IncidentStatus getStatus();

    /**
     * Returns the set of valid next states permitted from the current state.
     */
    Set<IncidentStatus> getAllowedTransitions();

    /**
     * Executes the transition to targetStatus on the incident if permitted,
     * otherwise throws InvalidStateTransitionException.
     *
     * @param incident the target incident aggregate
     * @param targetStatus the desired destination status
     */
    default void transition(Incident incident, IncidentStatus targetStatus) {
        if (!getAllowedTransitions().contains(targetStatus)) {
            throw new InvalidStateTransitionException(getStatus(), targetStatus);
        }
        incident.setStatus(targetStatus);
    }

    /**
     * Factory method returning the appropriate singleton state object for a status enum.
     */
    static IncidentState of(IncidentStatus status) {
        return switch (status) {
            case NEW -> NewState.INSTANCE;
            case CLASSIFIED -> ClassifiedState.INSTANCE;
            case ASSIGNED -> AssignedState.INSTANCE;
            case ACKNOWLEDGED -> AcknowledgedState.INSTANCE;
            case IN_PROGRESS -> InProgressState.INSTANCE;
            case RESOLVED -> ResolvedState.INSTANCE;
            case VERIFIED -> VerifiedState.INSTANCE;
            case CLOSED -> ClosedState.INSTANCE;
            case REOPENED -> ReopenedState.INSTANCE;
        };
    }
}
