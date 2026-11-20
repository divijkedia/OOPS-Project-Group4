package com.iitsm.service;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Urgency;
import com.iitsm.domain.event.IncidentAssignedEvent;
import com.iitsm.domain.event.IncidentCreatedEvent;
import com.iitsm.domain.exception.UnauthorizedOperationException;
import com.iitsm.domain.factory.IncidentFactory;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.SlaTracking;
import com.iitsm.domain.model.Technician;
import com.iitsm.domain.strategy.AssignmentStrategy;
import com.iitsm.domain.strategy.PriorityCalculator;
import com.iitsm.domain.strategy.PriorityResult;
import com.iitsm.repository.EmployeeRepository;
import com.iitsm.repository.IncidentCategoryRepository;
import com.iitsm.repository.IncidentRepository;
import com.iitsm.repository.ItServiceRepository;
import com.iitsm.repository.TechnicianRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service: Incident Orchestration Service")
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ItServiceRepository itServiceRepository;
    @Mock
    private IncidentCategoryRepository categoryRepository;
    @Mock
    private TechnicianRepository technicianRepository;
    @Mock
    private CategoryService categoryService;
    @Mock
    private SlaPolicyService slaPolicyService;
    @Mock
    private PriorityCalculator priorityCalculator;
    @Mock
    private AssignmentStrategyManager strategyManager;
    @Mock
    private AssignmentStrategy assignmentStrategy;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private com.iitsm.intelligence.DuplicateDetector duplicateDetector;

    private IncidentFactory incidentFactory;
    private IncidentService incidentService;

    private Employee reporter;
    private ItService paymentService;
    private Technician technician;
    private IncidentCategory category;

    @BeforeEach
    void setUp() {
        incidentFactory = new IncidentFactory();
        incidentService = new IncidentService(
                incidentRepository, employeeRepository, itServiceRepository, categoryRepository,
                technicianRepository, categoryService, slaPolicyService, priorityCalculator,
                strategyManager, incidentFactory, eventPublisher, duplicateDetector
        );

        reporter = new Employee("emp_john", "john@co.local", "hash", "John Doe", "Finance", "123");
        reporter.setId(7L);

        paymentService = new ItService("Payment Gateway", "Core Payment Service", BusinessCriticality.CRITICAL);
        paymentService.setId(1L);

        technician = new Technician("tech_alice", "alice@co.local", "hash", "Alice Smith", ExperienceLevel.EXPERT, 5);
        technician.setId(3L);
        technician.addSkill("DATABASE");

        category = new IncidentCategory("Database", "Database queries and storage", "sql,payment");
        category.setId(4L);
    }

    @Test
    @DisplayName("Should execute complete incident creation pipeline: auto-classify, priority calc, SLA resolution, assignment, events")
    void shouldCreateIncidentSuccessfully() {
        when(employeeRepository.findById(7L)).thenReturn(Optional.of(reporter));
        when(itServiceRepository.findById(1L)).thenReturn(Optional.of(paymentService));
        when(categoryService.suggestCategory(anyString())).thenReturn(Optional.of(category));

        when(priorityCalculator.calculate(eq(Impact.HIGH), eq(Urgency.CRITICAL), eq(BusinessCriticality.CRITICAL), eq(100)))
                .thenReturn(new PriorityResult(Priority.P1, 58, "Calculated as P1"));

        SlaTracking tracking = new SlaTracking(15, 60, LocalDateTime.now().plusMinutes(15), LocalDateTime.now().plusMinutes(60));
        when(slaPolicyService.calculateSlaTracking(eq(Priority.P1), eq(paymentService), any(LocalDateTime.class)))
                .thenReturn(tracking);

        when(strategyManager.getActiveStrategy()).thenReturn(assignmentStrategy);
        when(assignmentStrategy.getName()).thenReturn("SKILL_BASED");
        when(technicianRepository.findEligibleTechnicians()).thenReturn(List.of(technician));
        when(assignmentStrategy.assign(any(Incident.class), eq(List.of(technician)))).thenReturn(Optional.of(technician));

        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> {
            Incident inc = invocation.getArgument(0);
            inc.setId(101L);
            return inc;
        });

        Incident result = incidentService.createIncident(
                "Payment gateway database deadlock",
                "Transaction timeouts on payment checkout",
                7L, 1L, null, Impact.HIGH, Urgency.CRITICAL, 100
        );

        assertNotNull(result);
        assertEquals(101L, result.getId());
        assertEquals(Priority.P1, result.getPriority());
        assertEquals(IncidentStatus.ASSIGNED, result.getStatus());
        assertEquals(category, result.getCategory());
        assertEquals(technician, result.getAssignedTechnician());

        // Verify domain events published
        verify(eventPublisher, atLeastOnce()).publishEvent(any(IncidentCreatedEvent.class));
        verify(eventPublisher, atLeastOnce()).publishEvent(any(IncidentAssignedEvent.class));
    }

    @Test
    @DisplayName("Should prevent unauthorized technician from acknowledging or resolving incident")
    void shouldEnforceTechnicianAuthorization() {
        Incident incident = incidentFactory.createIncident("Issue", "Details", reporter, paymentService, Impact.LOW, Urgency.LOW, 1);
        incident.setId(50L);
        incident.classify(category);
        incident.assignTechnician(technician); // assigned to Alice (ID 3)

        when(incidentRepository.findById(50L)).thenReturn(Optional.of(incident));

        // Attempt by Bob (ID 4) should fail with UnauthorizedOperationException
        assertThrows(
                UnauthorizedOperationException.class,
                () -> incidentService.acknowledgeIncident(50L, 4L)
        );

        assertThrows(
                UnauthorizedOperationException.class,
                () -> incidentService.resolveIncident(50L, 4L, "Summary", "Cause", "Steps")
        );
    }

    @Test
    @DisplayName("Should progress through investigation, resolution, and closure lifecycle")
    void shouldProgressThroughResolutionAndClosure() {
        Incident incident = incidentFactory.createIncident("Issue", "Details", reporter, paymentService, Impact.MEDIUM, Urgency.MEDIUM, 5);
        incident.setId(60L);
        incident.classify(category);
        incident.assignTechnician(technician);

        when(incidentRepository.findById(60L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        // Acknowledge
        Incident acked = incidentService.acknowledgeIncident(60L, 3L);
        assertEquals(IncidentStatus.ACKNOWLEDGED, acked.getStatus());

        // Start investigation
        Incident inProg = incidentService.startInvestigation(60L, 3L);
        assertEquals(IncidentStatus.IN_PROGRESS, inProg.getStatus());

        // Resolve
        Incident resolved = incidentService.resolveIncident(60L, 3L, "Applied memory config", "Leak in cache", "Tuned heap");
        assertEquals(IncidentStatus.RESOLVED, resolved.getStatus());
        assertEquals(0, technician.getActiveIncidentCount(), "Workload should be decremented");

        // Verify
        Incident verified = incidentService.verifyIncident(60L, 7L);
        assertEquals(IncidentStatus.VERIFIED, verified.getStatus());

        // Close
        Incident closed = incidentService.closeIncident(60L, 1L);
        assertEquals(IncidentStatus.CLOSED, closed.getStatus());
    }

    @Test
    @DisplayName("Should reject feedback submission by users other than the original reporter")
    void shouldRejectFeedbackFromNonReporter() {
        Incident incident = incidentFactory.createIncident("Issue", "Details", reporter, paymentService, Impact.LOW, Urgency.LOW, 1);
        incident.setId(70L);
        incident.classify(category);
        incident.assignTechnician(technician);
        incident.acknowledge();
        incident.startInvestigation();
        incident.resolve(technician.getId(), "Fixed", "None", "None");

        when(incidentRepository.findById(70L)).thenReturn(Optional.of(incident));

        // Reporter is ID 7. Attempt by ID 99 must fail
        assertThrows(
                UnauthorizedOperationException.class,
                () -> incidentService.submitFeedback(70L, 99L, 5, "Great work")
        );
    }

    @Test
    @DisplayName("Should successfully reassign incident to another technician and update both technician workloads")
    void shouldSuccessfullyReassignIncident() {
        Incident incident = incidentFactory.createIncident("Issue", "Details", reporter, paymentService, Impact.LOW, Urgency.LOW, 1);
        incident.setId(80L);
        incident.classify(category);
        incident.assignTechnician(technician);

        Technician newTechnician = new Technician("tech_bob", "bob@corp.local", "hash", "Bob Jones", ExperienceLevel.MID, 5);
        newTechnician.setId(4L);

        when(incidentRepository.findById(80L)).thenReturn(Optional.of(incident));
        when(technicianRepository.findById(4L)).thenReturn(Optional.of(newTechnician));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident reassigned = incidentService.assignTechnician(80L, 4L, 1L);

        assertEquals(IncidentStatus.ASSIGNED, reassigned.getStatus());
        assertEquals(newTechnician, reassigned.getAssignedTechnician());
        verify(technicianRepository).save(newTechnician);
        verify(technicianRepository).save(technician);
    }

    @Test
    @DisplayName("Should successfully unassign technician completely and release workload")
    void shouldSuccessfullyUnassignIncident() {
        Incident incident = incidentFactory.createIncident("Issue", "Details", reporter, paymentService, Impact.LOW, Urgency.LOW, 1);
        incident.setId(85L);
        incident.classify(category);
        incident.assignTechnician(technician);
        assertEquals(1, technician.getActiveIncidentCount());

        when(incidentRepository.findById(85L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident unassigned = incidentService.unassignTechnician(85L, 1L);

        assertEquals(IncidentStatus.CLASSIFIED, unassigned.getStatus());
        assertNull(unassigned.getAssignedTechnician());
        assertEquals(0, technician.getActiveIncidentCount());
        verify(technicianRepository, atLeastOnce()).save(technician);
    }

    @Test
    @DisplayName("Should delegate assignTechnician with null technicianId to unassignTechnician")
    void shouldDelegateNullTechnicianToUnassign() {
        Incident incident = incidentFactory.createIncident("Issue", "Details", reporter, paymentService, Impact.LOW, Urgency.LOW, 1);
        incident.setId(86L);
        incident.classify(category);
        incident.assignTechnician(technician);

        when(incidentRepository.findById(86L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident result = incidentService.assignTechnician(86L, null, 1L);

        assertEquals(IncidentStatus.CLASSIFIED, result.getStatus());
        assertNull(result.getAssignedTechnician());
    }

    @Test
    @DisplayName("Should resolve incident successfully and record resolution record")
    void shouldResolveIncidentSuccessfully() {
        Incident primary = incidentFactory.createIncident("Primary Crash", "Details", reporter, paymentService, Impact.HIGH, Urgency.HIGH, 5);
        primary.setId(90L);
        primary.classify(category);
        primary.assignTechnician(technician);
        primary.acknowledge();
        primary.startInvestigation();

        when(incidentRepository.findById(90L)).thenReturn(Optional.of(primary));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident resolved = incidentService.resolveIncident(
                90L, 3L, "Applied database pool patch", "Connection starvation", "Increased connection limit to 200"
        );

        assertEquals(IncidentStatus.RESOLVED, resolved.getStatus());
        assertNotNull(resolved.getResolution());
        assertEquals("Applied database pool patch", resolved.getResolution().getSummary());
    }

    @Test
    @DisplayName("Should resolve incident along with correlated incidents in tandem when match is 85% or above")
    void shouldResolveIncidentAlongWithCorrelatedIncidents() {
        com.iitsm.intelligence.IncidentCorrelationEngine correlationEngine = mock(com.iitsm.intelligence.IncidentCorrelationEngine.class);
        IncidentService serviceWithEngine = new IncidentService(
                incidentRepository, employeeRepository, itServiceRepository, categoryRepository,
                technicianRepository, categoryService, slaPolicyService, priorityCalculator,
                strategyManager, incidentFactory, eventPublisher, duplicateDetector, correlationEngine, null
        );

        Incident primary = incidentFactory.createIncident("Primary Crash", "Details", reporter, paymentService, Impact.HIGH, Urgency.HIGH, 5);
        primary.setId(90L);
        primary.classify(category);
        primary.assignTechnician(technician);
        primary.acknowledge();
        primary.startInvestigation();

        Incident correlated = incidentFactory.createIncident("Duplicate Timeout", "Same issue", reporter, paymentService, Impact.MEDIUM, Urgency.MEDIUM, 2);
        correlated.setId(91L);
        correlated.classify(category);
        correlated.assignTechnician(technician);

        when(incidentRepository.findById(90L)).thenReturn(Optional.of(primary));
        when(incidentRepository.findById(91L)).thenReturn(Optional.of(correlated));
        when(technicianRepository.findById(3L)).thenReturn(Optional.of(technician));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        when(correlationEngine.evaluateCorrelation(any(Incident.class), eq(correlated)))
                .thenReturn(new com.iitsm.intelligence.IncidentCorrelationEngine.CorrelationResult(0.90, com.iitsm.intelligence.CorrelationType.SHARED_SERVICE, "Payment Gateway", "90% match"));
        when(duplicateDetector.findDuplicates(any(Incident.class), eq(0.0))).thenReturn(List.of());

        Incident resolved = serviceWithEngine.resolveIncident(
                90L, 3L, "Applied database pool patch", "Connection starvation", "Increased connection limit to 200",
                List.of(91L)
        );

        assertEquals(IncidentStatus.RESOLVED, resolved.getStatus());
        assertEquals(IncidentStatus.RESOLVED, correlated.getStatus());
        assertTrue(primary.getRelatedIncidents().contains(correlated));
        assertTrue(correlated.getRelatedIncidents().contains(primary));
        assertNotNull(correlated.getResolution());
        assertTrue(correlated.getResolution().getSummary().contains("Resolved via correlated incident INC-90"));
    }

    @Test
    @DisplayName("Should skip tandem resolution if correlation match score is below 85%")
    void shouldSkipTandemResolutionIfCorrelationScoreIsBelow85Percent() {
        com.iitsm.intelligence.IncidentCorrelationEngine correlationEngine = mock(com.iitsm.intelligence.IncidentCorrelationEngine.class);
        IncidentService serviceWithEngine = new IncidentService(
                incidentRepository, employeeRepository, itServiceRepository, categoryRepository,
                technicianRepository, categoryService, slaPolicyService, priorityCalculator,
                strategyManager, incidentFactory, eventPublisher, duplicateDetector, correlationEngine, null
        );

        Incident primary = incidentFactory.createIncident("Primary Crash", "Details", reporter, paymentService, Impact.HIGH, Urgency.HIGH, 5);
        primary.setId(90L);
        primary.classify(category);
        primary.assignTechnician(technician);
        primary.acknowledge();
        primary.startInvestigation();

        Incident lowMatch = incidentFactory.createIncident("Low Match Issue", "Unrelated", reporter, paymentService, Impact.LOW, Urgency.LOW, 1);
        lowMatch.setId(92L);
        lowMatch.classify(category);
        lowMatch.assignTechnician(technician);

        when(incidentRepository.findById(90L)).thenReturn(Optional.of(primary));
        when(incidentRepository.findById(92L)).thenReturn(Optional.of(lowMatch));
        when(technicianRepository.findById(3L)).thenReturn(Optional.of(technician));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        when(correlationEngine.evaluateCorrelation(any(Incident.class), eq(lowMatch)))
                .thenReturn(new com.iitsm.intelligence.IncidentCorrelationEngine.CorrelationResult(0.70, com.iitsm.intelligence.CorrelationType.SHARED_SERVICE, "Payment Gateway", "70% match"));
        when(duplicateDetector.findDuplicates(any(Incident.class), eq(0.0))).thenReturn(List.of());

        Incident resolved = serviceWithEngine.resolveIncident(
                90L, 3L, "Applied database pool patch", "Connection starvation", "Increased connection limit to 200",
                List.of(92L)
        );

        assertEquals(IncidentStatus.RESOLVED, resolved.getStatus());
        // lowMatch should NOT be resolved because match is 70% (< 85%)
        assertEquals(IncidentStatus.ASSIGNED, lowMatch.getStatus());
        assertNull(lowMatch.getResolution().getSummary());
    }

    @Test
    @DisplayName("Should batch resolve multiple incidents reporting the same issue")
    void shouldBatchResolveMultipleIncidentsReportingSameIssue() {
        Incident inc1 = incidentFactory.createIncident("Payment Error 1", "Details", reporter, paymentService, Impact.HIGH, Urgency.HIGH, 3);
        inc1.setId(95L);
        inc1.classify(category);
        inc1.assignTechnician(technician);
        inc1.acknowledge();
        inc1.startInvestigation();

        Incident inc2 = incidentFactory.createIncident("Payment Error 2", "Details", reporter, paymentService, Impact.HIGH, Urgency.HIGH, 3);
        inc2.setId(96L);
        inc2.classify(category);
        inc2.assignTechnician(technician);
        inc2.acknowledge();
        inc2.startInvestigation();

        when(incidentRepository.findById(95L)).thenReturn(Optional.of(inc1));
        when(incidentRepository.findById(96L)).thenReturn(Optional.of(inc2));
        when(technicianRepository.findById(3L)).thenReturn(Optional.of(technician));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        List<Incident> resolvedList = incidentService.batchResolveIncidents(
                List.of(95L, 96L), 3L, "Restarted payment microservice", "Deadlock on payments table", "Cleared lock and restarted"
        );

        assertEquals(2, resolvedList.size());
        assertEquals(IncidentStatus.RESOLVED, inc1.getStatus());
        assertEquals(IncidentStatus.RESOLVED, inc2.getStatus());
    }
}
