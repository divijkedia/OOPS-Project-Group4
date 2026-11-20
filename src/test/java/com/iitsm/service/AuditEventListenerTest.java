package com.iitsm.service;

import com.iitsm.domain.enums.AuditAction;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.event.IncidentCreatedEvent;
import com.iitsm.domain.event.IncidentStatusChangedEvent;
import com.iitsm.domain.event.IncidentUnassignedEvent;
import com.iitsm.domain.event.SlaViolatedEvent;
import com.iitsm.domain.model.Employee;
import com.iitsm.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Observer: Audit Event Listener")
class AuditEventListenerTest {

    @Mock
    private AuditService auditService;

    @Mock
    private UserRepository userRepository;

    private AuditEventListener auditEventListener;

    @BeforeEach
    void setUp() {
        auditEventListener = new AuditEventListener(auditService, userRepository);
    }

    @Test
    @DisplayName("Should record audit entry when IncidentCreatedEvent occurs")
    void shouldRecordAuditOnIncidentCreated() {
        Employee reporter = new Employee();
        reporter.setId(7L);
        reporter.setUsername("emp_john");
        when(userRepository.findById(7L)).thenReturn(Optional.of(reporter));

        IncidentCreatedEvent event = new IncidentCreatedEvent(301L, "Database deadlock", 7L, 3L, Priority.P1);

        auditEventListener.onIncidentCreated(event);

        verify(auditService).recordAction(
                eq(7L),
                eq("emp_john"),
                eq(AuditAction.CREATED),
                eq(301L),
                eq(null),
                eq("NEW"),
                contains("Database deadlock")
        );
    }

    @Test
    @DisplayName("Should record audit entry when IncidentStatusChangedEvent occurs")
    void shouldRecordAuditOnIncidentStatusChanged() {
        Employee user = new Employee();
        user.setId(7L);
        user.setUsername("emp_john");
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));

        IncidentStatusChangedEvent event = new IncidentStatusChangedEvent(
                301L,
                IncidentStatus.NEW,
                IncidentStatus.CLASSIFIED,
                7L,
                "Auto-classified based on keywords"
        );

        auditEventListener.onIncidentStatusChanged(event);

        verify(auditService).recordAction(
                eq(7L),
                eq("emp_john"),
                eq(AuditAction.STATUS_CHANGED),
                eq(301L),
                eq("NEW"),
                eq("CLASSIFIED"),
                contains("Auto-classified")
        );
    }

    @Test
    @DisplayName("Should record system audit entry when SlaViolatedEvent occurs")
    void shouldRecordAuditOnSlaViolated() {
        SlaViolatedEvent event = new SlaViolatedEvent(
                301L,
                "RESOLUTION",
                LocalDateTime.of(2026, 11, 6, 12, 0)
        );

        auditEventListener.onSlaViolated(event);

        verify(auditService).recordAction(
                eq(null),
                eq("SYSTEM"),
                eq(AuditAction.SLA_VIOLATED),
                eq(301L),
                eq("APPROACHING"),
                eq("VIOLATED"),
                contains("RESOLUTION")
        );
    }

    @Test
    @DisplayName("Should record audit entry when IncidentUnassignedEvent occurs")
    void shouldRecordAuditOnIncidentUnassigned() {
        IncidentUnassignedEvent event = new IncidentUnassignedEvent(301L, 3L, "Alice Smith");

        auditEventListener.onIncidentUnassigned(event);

        verify(auditService).recordAction(
                eq(3L),
                eq("Alice Smith"),
                eq(AuditAction.STATUS_CHANGED),
                eq(301L),
                eq("ASSIGNED"),
                eq("CLASSIFIED"),
                contains("Unassigned technician Alice Smith")
        );
    }
}
