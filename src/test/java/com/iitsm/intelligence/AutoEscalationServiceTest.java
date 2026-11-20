package com.iitsm.intelligence;

import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.event.IncidentEscalatedEvent;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.ItService;
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
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Intelligent: Automated Incident Escalation Engine Test")
class AutoEscalationServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private DefaultAutoEscalationService autoEscalationService;

    @BeforeEach
    void setUp() {
        autoEscalationService = new DefaultAutoEscalationService(incidentRepository, eventPublisher);
    }

    @Test
    @DisplayName("Should detect SLA breach and trigger escalation")
    void shouldTriggerEscalationOnSlaBreach() {
        Incident incident = new Incident();
        incident.setId(101L);
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        incident.setPriority(Priority.P3);
        incident.setEscalationLevel(EscalationLevel.NONE);

        SlaTracking sla = new SlaTracking();
        sla.setSlaStatus(SlaStatus.VIOLATED);
        incident.setSlaTracking(sla);

        assertTrue(autoEscalationService.shouldEscalate(incident));
    }

    @Test
    @DisplayName("Should detect duplicate cluster and trigger escalation")
    void shouldTriggerEscalationOnDuplicateCluster() {
        Incident incident = new Incident();
        incident.setId(102L);
        incident.setStatus(IncidentStatus.ASSIGNED);
        incident.setPriority(Priority.P2);
        incident.setEscalationLevel(EscalationLevel.NONE);

        Incident dup1 = new Incident();
        dup1.setId(103L);
        Incident dup2 = new Incident();
        dup2.setId(104L);

        incident.setRelatedIncidents(new HashSet<>(Set.of(dup1, dup2)));

        assertTrue(autoEscalationService.shouldEscalate(incident));
    }

    @Test
    @DisplayName("Should bump priority to P1 when manually escalating to System Administrator")
    void shouldBumpPriorityOnHighTierEscalation() {
        Incident incident = new Incident();
        incident.setId(105L);
        incident.setTitle("Critical Gateway Lag");
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        incident.setPriority(Priority.P3);
        incident.setPriorityScore(40);
        incident.setEscalationLevel(EscalationLevel.TECHNICIAN);

        when(incidentRepository.findById(105L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Incident escalated = autoEscalationService.escalateIncident(105L, EscalationLevel.SYSTEM_ADMINISTRATOR, "Out of depth", 5L);

        assertEquals(EscalationLevel.SYSTEM_ADMINISTRATOR, escalated.getEscalationLevel());
        assertEquals(Priority.P1, escalated.getPriority());
        assertEquals("Out of depth", escalated.getEscalationReason());
        assertNotNull(escalated.getEscalatedAt());

        verify(eventPublisher, atLeastOnce()).publishEvent(any(IncidentEscalatedEvent.class));
    }

    @Test
    @DisplayName("Should evaluate and escalate active incidents in sweep")
    void shouldEvaluateAndEscalateActiveIncidents() {
        Incident incident = new Incident();
        incident.setId(106L);
        incident.setTitle("Active unacknowledged incident");
        incident.setStatus(IncidentStatus.ASSIGNED);
        incident.setPriority(Priority.P3);
        incident.setEscalationLevel(EscalationLevel.NONE);

        SlaTracking sla = new SlaTracking();
        sla.setSlaStatus(SlaStatus.APPROACHING);
        incident.setSlaTracking(sla);

        when(incidentRepository.findByStatusNotIn(anyList())).thenReturn(List.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        int escalatedCount = autoEscalationService.evaluateAndEscalate();

        assertEquals(1, escalatedCount);
        assertEquals(EscalationLevel.TECHNICIAN, incident.getEscalationLevel());
        verify(incidentRepository).save(incident);
        verify(eventPublisher, atLeastOnce()).publishEvent(any(IncidentEscalatedEvent.class));
    }
}
