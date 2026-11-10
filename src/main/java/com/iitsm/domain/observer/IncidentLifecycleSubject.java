package com.iitsm.domain.observer;

import com.iitsm.domain.event.DomainEvent;
import com.iitsm.domain.model.Incident;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Classic GoF Observer Pattern: Concrete Subject implementation.
 * Manages registration and event broadcasting across all registered incident observers.
 * Uses a thread-safe CopyOnWriteArrayList for observer storage.
 */
@Component
public class IncidentLifecycleSubject implements IncidentSubject {

    private static final Logger log = LoggerFactory.getLogger(IncidentLifecycleSubject.class);

    private final List<IncidentObserver> observers = new CopyOnWriteArrayList<>();

    public IncidentLifecycleSubject() {
        // Default constructor
    }

    @Autowired(required = false)
    public IncidentLifecycleSubject(List<IncidentObserver> initialObservers) {
        if (initialObservers != null) {
            this.observers.addAll(initialObservers);
            log.info("Initialized IncidentLifecycleSubject with {} attached observers: {}",
                    initialObservers.size(),
                    initialObservers.stream().map(IncidentObserver::getObserverName).toList());
        }
    }

    @Override
    public void attach(IncidentObserver observer) {
        Objects.requireNonNull(observer, "Observer to attach cannot be null");
        if (!observers.contains(observer)) {
            observers.add(observer);
            log.debug("Observer attached: {}", observer.getObserverName());
        }
    }

    @Override
    public void detach(IncidentObserver observer) {
        Objects.requireNonNull(observer, "Observer to detach cannot be null");
        observers.remove(observer);
        log.debug("Observer detached: {}", observer.getObserverName());
    }

    @Override
    public void notifyObservers(Incident incident, DomainEvent event) {
        log.debug("Broadcasting event '{}' for Incident #{} to {} observers",
                event != null ? event.getClass().getSimpleName() : "UNKNOWN",
                incident != null ? incident.getId() : "N/A",
                observers.size());

        for (IncidentObserver observer : observers) {
            try {
                observer.onIncidentEvent(incident, event);
            } catch (Exception ex) {
                log.error("Error in observer '{}' while handling event: {}",
                        observer.getObserverName(), ex.getMessage(), ex);
            }
        }
    }

    @Override
    public List<IncidentObserver> getObservers() {
        return Collections.unmodifiableList(observers);
    }
}
