package com.iitsm.service;

import com.iitsm.domain.enums.NotificationChannel;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.event.IncidentAssignedEvent;
import com.iitsm.domain.event.IncidentCreatedEvent;
import com.iitsm.domain.event.IncidentUnassignedEvent;
import com.iitsm.domain.event.SlaViolatedEvent;
import com.iitsm.domain.model.Administrator;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.Technician;
import com.iitsm.repository.AdministratorRepository;
import com.iitsm.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Observer: Notification Event Listener")
class NotificationEventListenerTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private AdministratorRepository administratorRepository;

    private NotificationEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new NotificationEventListener(notificationService, incidentRepository, administratorRepository);
    }

    @Test
    @DisplayName("Should dispatch both IN_APP and EMAIL notifications to reporter when IncidentCreatedEvent occurs")
    void shouldDispatchNotificationsOnIncidentCreated() {
        IncidentCreatedEvent event = new IncidentCreatedEvent(501L, "VPN tunnel unreachable", 7L, 2L, Priority.P1);

        listener.onIncidentCreated(event);

        verify(notificationService).notifyUser(
                eq(7L),
                eq("INCIDENT_CREATED"),
                contains("INC-501"),
                contains("VPN tunnel unreachable"),
                eq(NotificationChannel.IN_APP),
                eq(501L)
        );

        verify(notificationService).notifyUser(
                eq(7L),
                eq("INCIDENT_CREATED"),
                contains("INC-501"),
                contains("VPN tunnel unreachable"),
                eq(NotificationChannel.EMAIL),
                eq(501L)
        );
    }

    @Test
    @DisplayName("Should dispatch both IN_APP and EMAIL notifications to technician when IncidentAssignedEvent occurs")
    void shouldDispatchNotificationsOnIncidentAssigned() {
        IncidentAssignedEvent event = new IncidentAssignedEvent(501L, 3L, "Alice Smith", "SKILL_BASED");

        listener.onIncidentAssigned(event);

        verify(notificationService).notifyUser(
                eq(3L),
                eq("INCIDENT_ASSIGNED"),
                contains("INC-501"),
                contains("SKILL_BASED"),
                eq(NotificationChannel.IN_APP),
                eq(501L)
        );

        verify(notificationService).notifyUser(
                eq(3L),
                eq("INCIDENT_ASSIGNED"),
                contains("INC-501"),
                contains("SKILL_BASED"),
                eq(NotificationChannel.EMAIL),
                eq(501L)
        );
    }

    @Test
    @DisplayName("Should dispatch both IN_APP and EMAIL notifications to technician when IncidentUnassignedEvent occurs")
    void shouldDispatchNotificationsOnIncidentUnassigned() {
        IncidentUnassignedEvent event = new IncidentUnassignedEvent(501L, 3L, "Alice Smith");

        listener.onIncidentUnassigned(event);

        verify(notificationService).notifyUser(
                eq(3L),
                eq("INCIDENT_UNASSIGNED"),
                contains("INC-501"),
                contains("unassigned"),
                eq(NotificationChannel.IN_APP),
                eq(501L)
        );

        verify(notificationService).notifyUser(
                eq(3L),
                eq("INCIDENT_UNASSIGNED"),
                contains("INC-501"),
                contains("unassigned"),
                eq(NotificationChannel.EMAIL),
                eq(501L)
        );
    }

    @Test
    @DisplayName("Should dispatch SLA breach alert to assigned technician and all administrators")
    void shouldDispatchAlertsOnSlaViolated() {
        Technician technician = new Technician();
        technician.setId(4L);

        Incident incident = mock(Incident.class);
        when(incident.getId()).thenReturn(501L);
        when(incident.getAssignedTechnician()).thenReturn(technician);

        when(incidentRepository.findById(501L)).thenReturn(Optional.of(incident));

        Administrator admin1 = new Administrator();
        admin1.setId(1L);
        Administrator admin2 = new Administrator();
        admin2.setId(2L);
        when(administratorRepository.findAll()).thenReturn(List.of(admin1, admin2));

        SlaViolatedEvent event = new SlaViolatedEvent(501L, "RESOLUTION", LocalDateTime.now().minusMinutes(5));

        listener.onSlaViolated(event);

        // Verify alert sent to technician 4 (IN_APP & EMAIL)
        verify(notificationService).notifyUser(eq(4L), eq("SLA_VIOLATED"), anyString(), anyString(), eq(NotificationChannel.IN_APP), eq(501L));
        verify(notificationService).notifyUser(eq(4L), eq("SLA_VIOLATED"), anyString(), anyString(), eq(NotificationChannel.EMAIL), eq(501L));

        // Verify alert sent to administrators 1 and 2 (IN_APP & EMAIL)
        verify(notificationService).notifyUser(eq(1L), eq("SLA_VIOLATED"), anyString(), anyString(), eq(NotificationChannel.IN_APP), eq(501L));
        verify(notificationService).notifyUser(eq(1L), eq("SLA_VIOLATED"), anyString(), anyString(), eq(NotificationChannel.EMAIL), eq(501L));
        verify(notificationService).notifyUser(eq(2L), eq("SLA_VIOLATED"), anyString(), anyString(), eq(NotificationChannel.IN_APP), eq(501L));
        verify(notificationService).notifyUser(eq(2L), eq("SLA_VIOLATED"), anyString(), anyString(), eq(NotificationChannel.EMAIL), eq(501L));
    }
}
