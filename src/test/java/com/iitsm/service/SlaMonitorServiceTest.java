package com.iitsm.service;

import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.event.SlaApproachingEvent;
import com.iitsm.domain.event.SlaViolatedEvent;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.SlaTracking;
import com.iitsm.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service: SLA Monitor Background Daemon")
class SlaMonitorServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private SlaMonitorService slaMonitorService;

    @BeforeEach
    void setUp() {
        slaMonitorService = new SlaMonitorService(incidentRepository, eventPublisher);
    }

    @Test
    @DisplayName("Should detect approaching deadline and transition SLA status to APPROACHING when >=80% window elapsed")
    void shouldDetectApproachingDeadline() {
        LocalDateTime baseTime = LocalDateTime.of(2026, 11, 6, 10, 0);
        LocalDateTime createdAt = baseTime;
        LocalDateTime resolutionDeadline = baseTime.plusMinutes(100);

        Incident incident = new Incident();
        incident.setId(101L);
        incident.setTitle("Database latency spike");
        incident.setDescription("Queries timing out on checkout");
        incident.setImpact(Impact.HIGH);
        incident.setUrgency(Urgency.HIGH);
        incident.setPriority(Priority.P2);
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        incident.setCreatedAt(createdAt);

        SlaTracking tracking = new SlaTracking(30, 100, baseTime.plusMinutes(30), resolutionDeadline);
        tracking.setRespondedAt(baseTime.plusMinutes(10)); // Response completed early
        incident.setSlaTracking(tracking);

        when(incidentRepository.findByStatusNotIn(any())).thenReturn(List.of(incident));

        // Evaluate at 85 minutes (85% elapsed, >= 80% threshold)
        LocalDateTime checkTime = baseTime.plusMinutes(85);
        int updated = slaMonitorService.checkSlaDeadlines(checkTime);

        assertEquals(1, updated);
        assertEquals(SlaStatus.APPROACHING, incident.getSlaTracking().getSlaStatus());
        verify(incidentRepository).save(incident);

        ArgumentCaptor<SlaApproachingEvent> eventCaptor = ArgumentCaptor.forClass(SlaApproachingEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        SlaApproachingEvent captured = eventCaptor.getValue();
        assertEquals(101L, captured.incidentId());
        assertEquals(15, captured.minutesRemaining());
    }

    @Test
    @DisplayName("Should detect violated deadline and transition SLA status to VIOLATED when now > deadline")
    void shouldDetectViolatedDeadline() {
        LocalDateTime baseTime = LocalDateTime.of(2026, 11, 6, 10, 0);
        LocalDateTime createdAt = baseTime;
        LocalDateTime resolutionDeadline = baseTime.plusMinutes(60);

        Incident incident = new Incident();
        incident.setId(102L);
        incident.setTitle("Core router failure");
        incident.setDescription("Data center offline");
        incident.setImpact(Impact.CRITICAL);
        incident.setUrgency(Urgency.CRITICAL);
        incident.setPriority(Priority.P1);
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        incident.setCreatedAt(createdAt);

        SlaTracking tracking = new SlaTracking(15, 60, baseTime.plusMinutes(15), resolutionDeadline);
        tracking.setRespondedAt(baseTime.plusMinutes(5)); // Responded on time
        incident.setSlaTracking(tracking);

        when(incidentRepository.findByStatusNotIn(any())).thenReturn(List.of(incident));

        // Evaluate at 65 minutes (breached)
        LocalDateTime checkTime = baseTime.plusMinutes(65);
        int updated = slaMonitorService.checkSlaDeadlines(checkTime);

        assertEquals(1, updated);
        assertEquals(SlaStatus.VIOLATED, incident.getSlaTracking().getSlaStatus());
        assertTrue(incident.getSlaTracking().isResolutionBreached());
        verify(incidentRepository).save(incident);

        ArgumentCaptor<SlaViolatedEvent> eventCaptor = ArgumentCaptor.forClass(SlaViolatedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        SlaViolatedEvent captured = eventCaptor.getValue();
        assertEquals(102L, captured.incidentId());
        assertEquals("RESOLUTION", captured.breachType());
    }

    @Test
    @DisplayName("Should leave incident ON_TRACK when well within SLA window (<80% elapsed)")
    void shouldLeaveIncidentOnTrackWhenWithinWindow() {
        LocalDateTime baseTime = LocalDateTime.of(2026, 11, 6, 10, 0);
        LocalDateTime createdAt = baseTime;
        LocalDateTime resolutionDeadline = baseTime.plusMinutes(100);

        Incident incident = new Incident();
        incident.setId(103L);
        incident.setTitle("Minor printer jam");
        incident.setDescription("Tray 2 stuck");
        incident.setImpact(Impact.LOW);
        incident.setUrgency(Urgency.LOW);
        incident.setPriority(Priority.P4);
        incident.setStatus(IncidentStatus.ASSIGNED);
        incident.setCreatedAt(createdAt);

        SlaTracking tracking = new SlaTracking(60, 100, baseTime.plusMinutes(60), resolutionDeadline);
        incident.setSlaTracking(tracking);

        when(incidentRepository.findByStatusNotIn(any())).thenReturn(List.of(incident));

        // Evaluate at 20 minutes (20% elapsed, < 80%)
        LocalDateTime checkTime = baseTime.plusMinutes(20);
        int updated = slaMonitorService.checkSlaDeadlines(checkTime);

        assertEquals(0, updated);
        assertEquals(SlaStatus.ON_TRACK, incident.getSlaTracking().getSlaStatus());
        assertFalse(incident.getSlaTracking().isAnyBreached());
        verify(incidentRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }
}
