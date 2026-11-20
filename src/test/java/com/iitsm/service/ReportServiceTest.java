package com.iitsm.service;

import com.iitsm.api.dto.response.IncidentOverviewReport;
import com.iitsm.api.dto.response.ServiceAnalysisReport;
import com.iitsm.api.dto.response.TechnicianWorkloadReport;
import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.SlaTracking;
import com.iitsm.domain.model.Technician;
import com.iitsm.repository.IncidentRepository;
import com.iitsm.repository.ItServiceRepository;
import com.iitsm.repository.TechnicianRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Service: Management Reporting Service")
class ReportServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private TechnicianRepository technicianRepository;

    @Mock
    private ItServiceRepository itServiceRepository;

    private ReportService reportService;

    @BeforeEach
    void setUp() {
        reportService = new ReportService(incidentRepository, technicianRepository, itServiceRepository);
    }

    @Test
    @DisplayName("Should generate accurate executive incident overview report and SLA compliance rate")
    void shouldGenerateOverviewReport() {
        when(incidentRepository.count()).thenReturn(20L);
        when(incidentRepository.countOpenIncidents(any())).thenReturn(8L);
        when(incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS)).thenReturn(5L);
        when(incidentRepository.countByStatus(IncidentStatus.RESOLVED)).thenReturn(8L);
        when(incidentRepository.countByStatus(IncidentStatus.CLOSED)).thenReturn(4L);
        when(incidentRepository.countSlaViolations()).thenReturn(2L);

        when(incidentRepository.countByPriority(Priority.P1)).thenReturn(3L);
        when(incidentRepository.countByPriority(Priority.P2)).thenReturn(7L);
        when(incidentRepository.countByPriority(Priority.P3)).thenReturn(6L);
        when(incidentRepository.countByPriority(Priority.P4)).thenReturn(4L);

        IncidentOverviewReport report = reportService.generateOverviewReport();

        assertEquals(20L, report.totalIncidents());
        assertEquals(8L, report.openIncidents());
        assertEquals(5L, report.inProgressIncidents());
        assertEquals(8L, report.resolvedIncidents());
        assertEquals(4L, report.closedIncidents());
        assertEquals(2L, report.slaBreaches());
        // Compliance: (20 - 2) / 20 * 100 = 90.0%
        assertEquals(90.0, report.slaComplianceRatePercent());
        assertEquals(3L, report.countByPriority().get(Priority.P1));
    }

    @Test
    @DisplayName("Should generate technician workload report with calculated capacity utilization")
    void shouldGenerateTechnicianWorkloadReport() {
        Technician tech1 = new Technician();
        tech1.setId(3L);
        tech1.setFullName("Alice Smith");
        tech1.setExperienceLevel(ExperienceLevel.SENIOR);
        tech1.setMaxWorkload(5);
        tech1.setActiveIncidentCount(4);
        tech1.setAvailable(true);

        Technician tech2 = new Technician();
        tech2.setId(4L);
        tech2.setFullName("Bob Jones");
        tech2.setExperienceLevel(ExperienceLevel.MID);
        tech2.setMaxWorkload(4);
        tech2.setActiveIncidentCount(1);
        tech2.setAvailable(true);

        when(technicianRepository.findAll()).thenReturn(List.of(tech1, tech2));

        List<TechnicianWorkloadReport> reports = reportService.generateTechnicianWorkloadReport();

        assertEquals(2, reports.size());
        // Alice: 4/5 * 100 = 80.0%
        assertEquals(80.0, reports.get(0).utilizationPercentage());
        assertEquals("Alice Smith", reports.get(0).fullName());
        // Bob: 1/4 * 100 = 25.0%
        assertEquals(25.0, reports.get(1).utilizationPercentage());
        assertEquals("Bob Jones", reports.get(1).fullName());
    }

    @Test
    @DisplayName("Should aggregate incident metrics and SLA breaches per IT service")
    void shouldGenerateServiceAnalysisReport() {
        ItService paymentService = new ItService("Payment Gateway", "Checkout", BusinessCriticality.CRITICAL);
        paymentService.setId(1L);

        Incident inc1 = new Incident();
        inc1.setId(101L);
        inc1.setAffectedService(paymentService);
        inc1.setStatus(IncidentStatus.IN_PROGRESS);
        SlaTracking sla1 = new SlaTracking();
        inc1.setSlaTracking(sla1);

        Incident inc2 = new Incident();
        inc2.setId(102L);
        inc2.setAffectedService(paymentService);
        inc2.setStatus(IncidentStatus.RESOLVED);
        SlaTracking sla2 = new SlaTracking();
        sla2.recordResolution(java.time.LocalDateTime.now());
        inc2.setSlaTracking(sla2);

        when(itServiceRepository.findAll()).thenReturn(List.of(paymentService));
        when(incidentRepository.findAll()).thenReturn(List.of(inc1, inc2));

        List<ServiceAnalysisReport> reports = reportService.generateServiceAnalysisReport();

        assertEquals(1, reports.size());
        ServiceAnalysisReport report = reports.get(0);
        assertEquals("Payment Gateway", report.serviceName());
        assertEquals(2L, report.totalIncidents());
        assertEquals(1L, report.activeIncidents());
        assertEquals(0L, report.slaBreaches());
    }
}
