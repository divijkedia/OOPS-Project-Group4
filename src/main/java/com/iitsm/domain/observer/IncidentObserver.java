package com.iitsm.domain.observer;

import com.iitsm.domain.event.DomainEvent;
import com.iitsm.domain.model.Incident;

/**
 * Classic GoF Observer Pattern: Observer interface.
 * Defines the contract for components that observe and respond to
 * incident lifecycle mutations, state transitions, and SLA alerts.
 */
public interface IncidentObserver {

    /**
     * Callback invoked by the Subject when an observed Incident changes state.
     *
     * @param incident the subject incident that underwent a state mutation
     * @param event the domain event payload describing the milestone
     */
    void onIncidentEvent(Incident incident, DomainEvent event);

    /**
     * Unique identifier or human-readable title of this observer.
     */
    String getObserverName();
}
