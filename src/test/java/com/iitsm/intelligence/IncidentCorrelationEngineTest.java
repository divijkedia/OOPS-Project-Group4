package com.iitsm.intelligence;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.event.DomainEvent;
import com.iitsm.domain.event.IncidentCorrelatedEvent;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.observer.IncidentSubject;
import com.iitsm.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Intelligent: Enterprise Incident Correlation & Root Cause Engine")
class IncidentCorrelationEngineTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentSubject incidentSubject;

    private IncidentCorrelationEngine engine;

    private ItService paymentGateway;
    private ItService customerDatabase;
    private ItService authService;
    private ItService emailService;
    private ItService chatService;

    private IncidentCategory dbCategory;

    @BeforeEach
    void setUp() {
        engine = new IncidentCorrelationEngine(incidentRepository, incidentSubject);

        paymentGateway = new ItService("Payment Processing Gateway", "Payments", BusinessCriticality.CRITICAL);
        paymentGateway.setId(1L);

        authService = new ItService("User Authentication Service", "SSO IAM", BusinessCriticality.CRITICAL);
        authService.setId(2L);

        customerDatabase = new ItService("Customer Database", "Primary DB Cluster", BusinessCriticality.HIGH);
        customerDatabase.setId(3L);

        emailService = new ItService("Corporate Email Service", "Email & Calendar", BusinessCriticality.HIGH);
        emailService.setId(4L);

        chatService = new ItService("Workplace Chat Application", "Chat", BusinessCriticality.LOW);
        chatService.setId(6L);

        dbCategory = new IncidentCategory("Database", "DB issues", "sql,query,timeout,deadlock");
        dbCategory.setId(4L);
    }

    @Test
    @DisplayName("Should detect high correlation on identical service with shared symptoms")
    void shouldEvaluateSameServiceHighCorrelation() {
        LocalDateTime now = LocalDateTime.now();

        Incident inc1 = new Incident();
        inc1.setId(101L);
        inc1.setTitle("Payment transactions failing with timeout");
        inc1.setDescription("Multiple payment gateway transactions failing due to timeout on checkout");
        inc1.setAffectedService(paymentGateway);
        inc1.setCreatedAt(now.minusMinutes(10));

        Incident inc2 = new Incident();
        inc2.setId(102L);
        inc2.setTitle("Payment gateway checkout slow and timeout");
        inc2.setDescription("Customers experiencing slow checkout and timeout errors on payment gateway");
        inc2.setAffectedService(paymentGateway);
        inc2.setCreatedAt(now);

        IncidentCorrelationEngine.CorrelationResult result = engine.evaluateCorrelation(inc1, inc2);

        assertTrue(result.score() >= 0.70, "Expected score >= 0.70 but was " + result.score());
        assertEquals(CorrelationType.SHARED_SERVICE, result.type());
        assertEquals("Payment Processing Gateway", result.sharedComponent());
        assertTrue(result.rationale().contains("Payment Processing Gateway"));
    }

    @Test
    @DisplayName("Should correlate cross-service incidents sharing infrastructure architectural dependency")
    void shouldEvaluateCrossServiceInfrastructureDependency() {
        LocalDateTime now = LocalDateTime.now();

        Incident dbIncident = new Incident();
        dbIncident.setId(201L);
        dbIncident.setTitle("Postgres connection pool exhausted on Customer Database");
        dbIncident.setDescription("Customer database cluster experiencing high lock contention and connection pool exhaustion");
        dbIncident.setAffectedService(customerDatabase);
        dbIncident.setCreatedAt(now.minusMinutes(15));

        Incident paymentIncident = new Incident();
        paymentIncident.setId(202L);
        paymentIncident.setTitle("Payment Gateway failing to save customer orders");
        paymentIncident.setDescription("Payment processing gateway timing out while querying customer orders and account details");
        paymentIncident.setAffectedService(paymentGateway);
        paymentIncident.setCreatedAt(now);

        IncidentCorrelationEngine.CorrelationResult result = engine.evaluateCorrelation(paymentIncident, dbIncident);

        assertTrue(result.score() >= 0.55, "Expected dependency score >= 0.55 but was " + result.score());
        assertEquals(CorrelationType.INFRASTRUCTURE_DEPENDENCY, result.type());
        assertEquals("Customer Database", result.sharedComponent());
        assertTrue(result.rationale().contains("Customer Database"));
    }

    @Test
    @DisplayName("Should correlate services with shared upstream dependency (SSO / Auth)")
    void shouldCorrelateSharedUpstreamDependency() {
        LocalDateTime now = LocalDateTime.now();

        Incident emailIncident = new Incident();
        emailIncident.setId(301L);
        emailIncident.setTitle("Corporate Email authentication failed");
        emailIncident.setDescription("Users cannot log in to corporate email, SSO directory token validation failing");
        emailIncident.setAffectedService(emailService);
        emailIncident.setCreatedAt(now.minusMinutes(5));

        Incident chatIncident = new Incident();
        chatIncident.setId(302L);
        chatIncident.setTitle("Workplace Chat login failure");
        chatIncident.setDescription("Employees unable to log in to chat, directory auth login session refused");
        chatIncident.setAffectedService(chatService);
        chatIncident.setCreatedAt(now);

        IncidentCorrelationEngine.CorrelationResult result = engine.evaluateCorrelation(emailIncident, chatIncident);

        assertTrue(result.score() >= 0.50, "Expected shared upstream score >= 0.50 but was " + result.score());
        assertEquals(CorrelationType.INFRASTRUCTURE_DEPENDENCY, result.type());
        assertEquals("User Authentication Service", result.sharedComponent());
    }

    @Test
    @DisplayName("Should correlate incidents by symptom pattern when failure modes overlap")
    void shouldCorrelateSymptomPattern() {
        LocalDateTime now = LocalDateTime.now();

        Incident incA = new Incident();
        incA.setId(401L);
        incA.setTitle("Database query deadlock in customer service");
        incA.setDescription("Postgres SQL deadlock detected during table query execution");
        incA.setCreatedAt(now.minusMinutes(20));

        Incident incB = new Incident();
        incB.setId(402L);
        incB.setTitle("Deadlock and slow query response");
        incB.setDescription("Service experiencing database deadlock and lock contention");
        incB.setCreatedAt(now);

        IncidentCorrelationEngine.CorrelationResult result = engine.evaluateCorrelation(incA, incB);

        assertTrue(result.score() >= 0.40);
        assertEquals(CorrelationType.SYMPTOM_PATTERN, result.type());
        assertTrue(result.sharedComponent().contains("Database"));
    }

    @Test
    @DisplayName("Should compute accurate blast radius and probable root cause in correlation report")
    void shouldComputeBlastRadiusAndProbableRootCause() {
        LocalDateTime now = LocalDateTime.now();

        Incident target = new Incident();
        target.setId(501L);
        target.setTitle("Payment Gateway transaction timeouts");
        target.setDescription("Checkout failing due to database timeout");
        target.setAffectedService(paymentGateway);
        target.setAffectedUserCount(15);
        target.setPriority(Priority.P2);
        target.setCreatedAt(now);

        Incident relatedDb = new Incident();
        relatedDb.setId(502L);
        relatedDb.setTitle("Customer Database high connection pool latency");
        relatedDb.setDescription("Customer database query response times elevated and pool full");
        relatedDb.setAffectedService(customerDatabase);
        relatedDb.setAffectedUserCount(40);
        relatedDb.setPriority(Priority.P1);
        relatedDb.setCreatedAt(now.minusMinutes(25));

        when(incidentRepository.findAllRecentWithDetails(any())).thenReturn(List.of(target, relatedDb));

        IncidentCorrelationReport report = engine.analyzeCorrelations(target);

        assertEquals(501L, report.targetIncidentId());
        assertEquals("Payment Processing Gateway", report.targetServiceName());
        assertEquals(1, report.totalCorrelatedCount());
        assertEquals(55, report.blastRadiusUserCount()); // 15 + 40
        assertEquals(2, report.impactedServicesCount()); // Payment Gateway + Customer Database
        assertEquals(Priority.P1, report.highestPriorityInCluster());
        assertTrue(report.probableRootCause().contains("Customer Database"));
        assertFalse(report.correlations().isEmpty());
    }

    @Test
    @DisplayName("Should bidirectionally link correlated incidents, publish domain event, and auto-escalate high-impact clusters")
    void shouldCorrelateAndLinkStrongMatches() {
        LocalDateTime now = LocalDateTime.now();

        Incident existingDb = new Incident();
        existingDb.setId(601L);
        existingDb.setTitle("Customer Database connection pool failure");
        existingDb.setDescription("Database connections timing out on postgres pool");
        existingDb.setAffectedService(customerDatabase);
        existingDb.setAffectedUserCount(25);
        existingDb.setPriority(Priority.P2);
        existingDb.setCreatedAt(now.minusMinutes(10));

        Incident newPayment = new Incident();
        newPayment.setId(602L);
        newPayment.setTitle("Payment Gateway database connection timeout");
        newPayment.setDescription("Customer orders failing due to customer database connection timeout");
        newPayment.setAffectedService(paymentGateway);
        newPayment.setAffectedUserCount(12);
        newPayment.setPriority(Priority.P3); // initially P3
        newPayment.setCreatedAt(now);

        when(incidentRepository.findAllRecentWithDetails(any())).thenReturn(List.of(existingDb, newPayment));
        when(incidentRepository.findById(601L)).thenReturn(Optional.of(existingDb));

        List<CorrelatedIncident> linked = engine.correlateAndLink(newPayment);

        assertFalse(linked.isEmpty());
        assertEquals(601L, linked.get(0).incidentId());
        assertTrue(newPayment.getRelatedIncidents().contains(existingDb));
        assertTrue(existingDb.getRelatedIncidents().contains(newPayment));

        // Verifies auto-escalation to P1 because paymentGateway is CRITICAL and blast radius >= 10 users
        assertEquals(Priority.P1, newPayment.getPriority());
        assertEquals(EscalationLevel.TEAM_LEAD, newPayment.getEscalationLevel());

        // Verifies domain event dispatching
        ArgumentCaptor<DomainEvent> eventCaptor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(incidentSubject).notifyObservers(eq(newPayment), eventCaptor.capture());
        assertTrue(eventCaptor.getValue() instanceof IncidentCorrelatedEvent);
        IncidentCorrelatedEvent correlatedEvent = (IncidentCorrelatedEvent) eventCaptor.getValue();
        assertEquals(602L, correlatedEvent.incidentId());
        assertEquals(601L, correlatedEvent.correlatedIncidentId());

        verify(incidentRepository).save(existingDb);
        verify(incidentRepository).save(newPayment);
    }

    @Test
    @DisplayName("Should detect enterprise outage clusters using graph connected component analysis")
    void shouldDetectActiveOutageClusters() {
        LocalDateTime now = LocalDateTime.now();

        // Cluster 1: Payment + DB
        Incident inc1 = new Incident();
        inc1.setId(701L);
        inc1.setTitle("Payment Gateway database query timeout");
        inc1.setDescription("Transactions failing on customer database query timeout");
        inc1.setAffectedService(paymentGateway);
        inc1.setStatus(IncidentStatus.IN_PROGRESS);
        inc1.setPriority(Priority.P1);
        inc1.setAffectedUserCount(30);
        inc1.setCreatedAt(now.minusMinutes(15));

        Incident inc2 = new Incident();
        inc2.setId(702L);
        inc2.setTitle("Customer Database postgres connection pool deadlock");
        inc2.setDescription("Customer database deadlock and connection timeout");
        inc2.setAffectedService(customerDatabase);
        inc2.setStatus(IncidentStatus.IN_PROGRESS);
        inc2.setPriority(Priority.P1);
        inc2.setAffectedUserCount(50);
        inc2.setCreatedAt(now.minusMinutes(20));

        // Isolated Incident 3: Unrelated hardware issue
        Incident inc3 = new Incident();
        inc3.setId(703L);
        inc3.setTitle("Broken office printer roller");
        inc3.setDescription("Paper jam in 3rd floor marketing laser printer");
        inc3.setStatus(IncidentStatus.ASSIGNED);
        inc3.setPriority(Priority.P4);
        inc3.setAffectedUserCount(1);
        inc3.setCreatedAt(now);

        when(incidentRepository.findAllActiveWithDetails(any())).thenReturn(List.of(inc1, inc2, inc3));

        List<OutageCluster> clusters = engine.detectAllActiveClusters();

        assertEquals(1, clusters.size());
        OutageCluster cluster = clusters.get(0);
        assertEquals(2, cluster.incidentCount());
        assertEquals(80, cluster.totalAffectedUsers()); // 30 + 50
        assertEquals(Priority.P1, cluster.highestPriority());
        assertTrue(cluster.incidentIds().contains(701L));
        assertTrue(cluster.incidentIds().contains(702L));
        assertTrue(cluster.sharedComponent().contains("Customer Database"));
    }
}
