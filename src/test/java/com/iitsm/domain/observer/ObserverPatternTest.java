package com.iitsm.domain.observer;

import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.event.DomainEvent;
import com.iitsm.domain.event.IncidentCreatedEvent;
import com.iitsm.domain.event.IncidentStatusChangedEvent;
import com.iitsm.domain.event.SlaApproachingEvent;
import com.iitsm.domain.event.SlaViolatedEvent;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.SlaTracking;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Observer Pattern: GoF Incident Subject and Observers Test")
class ObserverPatternTest {

    private IncidentLifecycleSubject subject;

    @BeforeEach
    void setUp() {
        subject = new IncidentLifecycleSubject();
    }

    @Test
    @DisplayName("Should attach observers and broadcast incident lifecycle events")
    void shouldBroadcastToAttachedObservers() {
        List<DomainEvent> receivedEventsA = new ArrayList<>();
        List<DomainEvent> receivedEventsB = new ArrayList<>();

        IncidentObserver observerA = new IncidentObserver() {
            @Override
            public void onIncidentEvent(Incident incident, DomainEvent event) {
                receivedEventsA.add(event);
            }

            @Override
            public String getObserverName() {
                return "ObserverA";
            }
        };

        IncidentObserver observerB = new IncidentObserver() {
            @Override
            public void onIncidentEvent(Incident incident, DomainEvent event) {
                receivedEventsB.add(event);
            }

            @Override
            public String getObserverName() {
                return "ObserverB";
            }
        };

        subject.attach(observerA);
        subject.attach(observerB);
        assertEquals(2, subject.getObservers().size());

        Incident incident = new Incident();
        incident.setId(501L);
        IncidentCreatedEvent createdEvent = new IncidentCreatedEvent(501L, "Payment down", 1L, 2L, Priority.P1);

        subject.notifyObservers(incident, createdEvent);

        assertEquals(1, receivedEventsA.size());
        assertEquals(createdEvent, receivedEventsA.get(0));
        assertEquals(1, receivedEventsB.size());
        assertEquals(createdEvent, receivedEventsB.get(0));
    }

    @Test
    @DisplayName("Should stop broadcasting to detached observer")
    void shouldStopBroadcastingWhenDetached() {
        List<DomainEvent> events = new ArrayList<>();
        IncidentObserver observer = new IncidentObserver() {
            @Override
            public void onIncidentEvent(Incident incident, DomainEvent event) {
                events.add(event);
            }

            @Override
            public String getObserverName() {
                return "TestObserver";
            }
        };

        subject.attach(observer);
        assertEquals(1, subject.getObservers().size());

        Incident incident = new Incident();
        incident.setId(502L);
        subject.notifyObservers(incident, new IncidentStatusChangedEvent(502L, IncidentStatus.NEW, IncidentStatus.ASSIGNED, 1L, "Assigned"));
        assertEquals(1, events.size());

        subject.detach(observer);
        assertEquals(0, subject.getObservers().size());

        subject.notifyObservers(incident, new IncidentStatusChangedEvent(502L, IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS, 1L, "Investigating"));
        assertEquals(1, events.size(), "Detached observer must not receive subsequent events");
    }

    @Test
    @DisplayName("SlaMonitoringIncidentObserver should handle SLA threshold violations cleanly")
    void shouldHandleSlaMonitoringEvents() {
        SlaMonitoringIncidentObserver slaObserver = new SlaMonitoringIncidentObserver();
        subject.attach(slaObserver);

        Incident incident = new Incident();
        incident.setId(503L);
        SlaTracking tracking = new SlaTracking();
        tracking.setSlaStatus(SlaStatus.VIOLATED);
        incident.setSlaTracking(tracking);

        assertDoesNotThrow(() -> {
            subject.notifyObservers(incident, new SlaViolatedEvent(503L, "RESOLUTION", LocalDateTime.now().minusMinutes(5)));
            subject.notifyObservers(incident, new SlaApproachingEvent(503L, LocalDateTime.now().plusMinutes(10), 10L));
        });
    }

    @Test
    @DisplayName("Exception in one observer should not disrupt other observers")
    void shouldIsolateObserverExceptions() {
        List<DomainEvent> successEvents = new ArrayList<>();

        IncidentObserver failingObserver = new IncidentObserver() {
            @Override
            public void onIncidentEvent(Incident incident, DomainEvent event) {
                throw new RuntimeException("Simulated downstream transport failure");
            }

            @Override
            public String getObserverName() {
                return "FailingObserver";
            }
        };

        IncidentObserver healthyObserver = new IncidentObserver() {
            @Override
            public void onIncidentEvent(Incident incident, DomainEvent event) {
                successEvents.add(event);
            }

            @Override
            public String getObserverName() {
                return "HealthyObserver";
            }
        };

        subject.attach(failingObserver);
        subject.attach(healthyObserver);

        Incident incident = new Incident();
        incident.setId(504L);
        DomainEvent event = new IncidentCreatedEvent(504L, "Storage latency", 2L, 1L, Priority.P2);

        assertDoesNotThrow(() -> subject.notifyObservers(incident, event));
        assertEquals(1, successEvents.size(), "Healthy observer must still receive event despite failing sibling");
    }
}
