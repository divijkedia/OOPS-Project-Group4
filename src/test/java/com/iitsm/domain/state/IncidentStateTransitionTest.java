package com.iitsm.domain.state;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.exception.InvalidStateTransitionException;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.Technician;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("State Pattern: Incident Lifecycle Transitions")
class IncidentStateTransitionTest {

    private Incident incident;
    private Employee employee;
    private ItService service;
    private Technician technician;
    private IncidentCategory category;

    @BeforeEach
    void setUp() {
        employee = new Employee("emp_test", "emp@test.local", "hash", "Test Employee", "Engineering", "123");
        service = new ItService("Auth Service", "Core SSO", BusinessCriticality.CRITICAL);
        technician = new Technician("tech_test", "tech@test.local", "hash", "Test Tech", ExperienceLevel.SENIOR, 5);
        technician.addSkill("SECURITY");
        category = new IncidentCategory("Security", "Security issues", "breach,auth");

        incident = new Incident("Login failure", "Cannot authenticate", employee, service, Impact.HIGH, Urgency.HIGH, 25);
    }

    @Test
    @DisplayName("Should successfully follow full happy-path lifecycle: NEW -> CLOSED")
    void shouldFollowValidLifecycleFlow() {
        assertEquals(IncidentStatus.NEW, incident.getStatus());

        // NEW -> CLASSIFIED
        incident.classify(category);
        assertEquals(IncidentStatus.CLASSIFIED, incident.getStatus());
        assertEquals(category, incident.getCategory());

        // CLASSIFIED -> ASSIGNED
        incident.assignTechnician(technician);
        assertEquals(IncidentStatus.ASSIGNED, incident.getStatus());
        assertEquals(technician, incident.getAssignedTechnician());
        assertEquals(1, technician.getActiveIncidentCount());

        // ASSIGNED -> ACKNOWLEDGED
        incident.acknowledge();
        assertEquals(IncidentStatus.ACKNOWLEDGED, incident.getStatus());
        assertNotNull(incident.getSlaTracking().getRespondedAt());

        // ACKNOWLEDGED -> IN_PROGRESS
        incident.startInvestigation();
        assertEquals(IncidentStatus.IN_PROGRESS, incident.getStatus());

        // IN_PROGRESS -> RESOLVED
        incident.resolve(technician.getId(), "Restarted auth server", "Memory leak in JWT filter", "Configured GC tuning");
        assertEquals(IncidentStatus.RESOLVED, incident.getStatus());
        assertNotNull(incident.getSlaTracking().getResolvedAt());
        assertEquals(0, technician.getActiveIncidentCount(), "Workload should be decremented upon resolution");

        // RESOLVED -> VERIFIED
        incident.verify();
        assertEquals(IncidentStatus.VERIFIED, incident.getStatus());

        // VERIFIED -> CLOSED
        incident.close();
        assertEquals(IncidentStatus.CLOSED, incident.getStatus());
        assertNotNull(incident.getSlaTracking().getClosedAt());
    }

    @Test
    @DisplayName("Should throw InvalidStateTransitionException when skipping steps (NEW -> CLOSED)")
    void shouldRejectDirectNewToClosed() {
        assertEquals(IncidentStatus.NEW, incident.getStatus());

        InvalidStateTransitionException ex = assertThrows(
                InvalidStateTransitionException.class,
                () -> incident.transitionTo(IncidentStatus.CLOSED)
        );

        assertEquals(IncidentStatus.NEW, ex.getFromStatus());
        assertEquals(IncidentStatus.CLOSED, ex.getToStatus());
        assertEquals(IncidentStatus.NEW, incident.getStatus(), "Status must remain unchanged on failure");
    }

    @Test
    @DisplayName("Should throw InvalidStateTransitionException when resolving unassigned incident (NEW -> RESOLVED)")
    void shouldRejectDirectNewToResolved() {
        assertThrows(
                InvalidStateTransitionException.class,
                () -> incident.resolve(1L, "Fixed", "None", "None")
        );
    }

    @Test
    @DisplayName("Should throw InvalidStateTransitionException when jumping from ASSIGNED to RESOLVED without investigation")
    void shouldRejectAssignedToResolved() {
        incident.classify(category);
        incident.assignTechnician(technician);

        assertThrows(
                InvalidStateTransitionException.class,
                () -> incident.resolve(1L, "Fixed", "None", "None")
        );
    }

    @Test
    @DisplayName("Should allow reopening a CLOSED incident and re-entering the pipeline")
    void shouldSupportReopeningClosedIncident() {
        // Progress to CLOSED
        incident.classify(category);
        incident.assignTechnician(technician);
        incident.acknowledge();
        incident.startInvestigation();
        incident.resolve(technician.getId(), "Applied patch", "Bug", "Patch");
        incident.verify();
        incident.close();
        assertEquals(IncidentStatus.CLOSED, incident.getStatus());

        // CLOSED -> REOPENED
        incident.reopen("Issue recurred 2 hours later");
        assertEquals(IncidentStatus.REOPENED, incident.getStatus());

        // REOPENED -> CLASSIFIED
        incident.classify(category);
        assertEquals(IncidentStatus.CLASSIFIED, incident.getStatus());
    }

    @Test
    @DisplayName("Should allow submitting feedback only after incident is RESOLVED, VERIFIED, or CLOSED")
    void shouldEnforceFeedbackAllowedOnlyAfterResolution() {
        // Attempting feedback while NEW should fail
        assertThrows(InvalidStateTransitionException.class, () -> incident.submitFeedback(5, "Great!"));

        // Progress to RESOLVED
        incident.classify(category);
        incident.assignTechnician(technician);
        incident.acknowledge();
        incident.startInvestigation();
        incident.resolve(technician.getId(), "Fixed", "Bug", "Fixed");

        // Now feedback is valid
        assertDoesNotThrow(() -> incident.submitFeedback(5, "Excellent turnaround!"));
        assertEquals(5, incident.getFeedback().getRating());
        assertEquals("Excellent turnaround!", incident.getFeedback().getComment());
    }

    @Test
    @DisplayName("Should allow reassignment from ASSIGNED, ACKNOWLEDGED, and IN_PROGRESS states, updating workloads")
    void shouldAllowReassignmentAcrossStates() {
        technician.setId(10L);
        Technician tech2 = new Technician("tech_bob", "bob@test.local", "hash", "Bob Jones", ExperienceLevel.MID, 5);
        tech2.setId(20L);

        // 1. Initial assignment (CLASSIFIED -> ASSIGNED)
        incident.classify(category);
        incident.assignTechnician(technician);
        assertEquals(IncidentStatus.ASSIGNED, incident.getStatus());
        assertEquals(1, technician.getActiveIncidentCount());
        assertEquals(0, tech2.getActiveIncidentCount());

        // 2. Reassign when already ASSIGNED (ASSIGNED -> ASSIGNED)
        incident.assignTechnician(tech2);
        assertEquals(IncidentStatus.ASSIGNED, incident.getStatus());
        assertEquals(tech2, incident.getAssignedTechnician());
        assertEquals(0, technician.getActiveIncidentCount(), "Old tech workload decremented");
        assertEquals(1, tech2.getActiveIncidentCount(), "New tech workload incremented");

        // 3. Reassign when ACKNOWLEDGED (ACKNOWLEDGED -> ASSIGNED)
        incident.acknowledge();
        assertEquals(IncidentStatus.ACKNOWLEDGED, incident.getStatus());
        incident.assignTechnician(technician);
        assertEquals(IncidentStatus.ASSIGNED, incident.getStatus());
        assertEquals(technician, incident.getAssignedTechnician());
        assertEquals(1, technician.getActiveIncidentCount());
        assertEquals(0, tech2.getActiveIncidentCount());

        // 4. Reassign when IN_PROGRESS (IN_PROGRESS -> ASSIGNED)
        incident.acknowledge();
        incident.startInvestigation();
        assertEquals(IncidentStatus.IN_PROGRESS, incident.getStatus());
        incident.assignTechnician(tech2);
        assertEquals(IncidentStatus.ASSIGNED, incident.getStatus());
        assertEquals(tech2, incident.getAssignedTechnician());
        assertEquals(0, technician.getActiveIncidentCount());
        assertEquals(1, tech2.getActiveIncidentCount());
    }

    @Test
    @DisplayName("Should successfully unassign technician completely from ASSIGNED, ACKNOWLEDGED, and IN_PROGRESS states")
    void shouldSuccessfullyUnassignAcrossStates() {
        // 1. Unassign from ASSIGNED -> CLASSIFIED
        incident.classify(category);
        incident.assignTechnician(technician);
        assertEquals(IncidentStatus.ASSIGNED, incident.getStatus());
        assertEquals(1, technician.getActiveIncidentCount());

        incident.unassignTechnician();
        assertEquals(IncidentStatus.CLASSIFIED, incident.getStatus());
        assertNull(incident.getAssignedTechnician());
        assertEquals(0, technician.getActiveIncidentCount(), "Workload must decrement upon unassign");

        // 2. Unassign from ACKNOWLEDGED -> CLASSIFIED
        incident.assignTechnician(technician);
        incident.acknowledge();
        assertEquals(IncidentStatus.ACKNOWLEDGED, incident.getStatus());
        assertEquals(1, technician.getActiveIncidentCount());

        incident.unassignTechnician();
        assertEquals(IncidentStatus.CLASSIFIED, incident.getStatus());
        assertNull(incident.getAssignedTechnician());
        assertEquals(0, technician.getActiveIncidentCount());

        // 3. Unassign from IN_PROGRESS -> CLASSIFIED
        incident.assignTechnician(technician);
        incident.acknowledge();
        incident.startInvestigation();
        assertEquals(IncidentStatus.IN_PROGRESS, incident.getStatus());
        assertEquals(1, technician.getActiveIncidentCount());

        incident.unassignTechnician();
        assertEquals(IncidentStatus.CLASSIFIED, incident.getStatus());
        assertNull(incident.getAssignedTechnician());
        assertEquals(0, technician.getActiveIncidentCount());
    }

    @Test
    @DisplayName("Should reject unassigning resolved or closed incident")
    void shouldRejectUnassignOnResolvedOrClosedIncident() {
        incident.classify(category);
        incident.assignTechnician(technician);
        incident.acknowledge();
        incident.startInvestigation();
        incident.resolve(technician.getId(), "Resolved", "Cause", "Steps");

        assertEquals(IncidentStatus.RESOLVED, incident.getStatus());
        assertThrows(IllegalStateException.class, () -> incident.unassignTechnician());
    }
}
