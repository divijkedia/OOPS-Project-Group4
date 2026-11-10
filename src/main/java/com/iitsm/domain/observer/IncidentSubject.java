package com.iitsm.domain.observer;

import com.iitsm.domain.event.DomainEvent;
import com.iitsm.domain.model.Incident;

import java.util.List;

/**
 * Classic GoF Observer Pattern: Subject (Observable) interface.
 * Maintains a registry of attached IncidentObservers and broadcasts lifecycle notifications.
 */
public interface IncidentSubject {

    /**
     * Attaches an observer to receive incident lifecycle notifications.
     */
    void attach(IncidentObserver observer);

    /**
     * Detaches an observer so it no longer receives updates.
     */
    void detach(IncidentObserver observer);

    /**
     * Broadcasts an incident lifecycle event to all currently attached observers.
     *
     * @param incident the subject incident
     * @param event the event payload
     */
    void notifyObservers(Incident incident, DomainEvent event);

    /**
     * Returns an unmodifiable snapshot of currently attached observers.
     */
    List<IncidentObserver> getObservers();
}
