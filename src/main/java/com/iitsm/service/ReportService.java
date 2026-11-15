package com.iitsm.service;

import com.iitsm.api.dto.response.IncidentOverviewReport;
import com.iitsm.api.dto.response.ServiceAnalysisReport;
import com.iitsm.api.dto.response.TechnicianWorkloadReport;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.Technician;
import com.iitsm.repository.IncidentRepository;
import com.iitsm.repository.ItServiceRepository;
import com.iitsm.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Service calculating aggregate operational reports and management metrics
 * including SLA compliance, technician workload distributions, and service impact analyses.
 */
@Service
@Transactional(readOnly = true)
public class ReportService {

    private final IncidentRepository incidentRepository;
    private final TechnicianRepository technicianRepository;
    private final ItServiceRepository itServiceRepository;

    public ReportService(IncidentRepository incidentRepository,
                         TechnicianRepository technicianRepository,
                         ItServiceRepository itServiceRepository) {
        this.incidentRepository = incidentRepository;
        this.technicianRepository = technicianRepository;
        this.itServiceRepository = itServiceRepository;
    }

    /**
     * Generates executive overview metrics: incident volumes, status distributions,
     * priority breakdowns, and SLA compliance percentages.
     */
    public IncidentOverviewReport generateOverviewReport() {
        long total = incidentRepository.count();
        long open = incidentRepository.countOpenIncidents(List.of(IncidentStatus.CLOSED, IncidentStatus.RESOLVED));
        long inProgress = incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS);
        long resolved = incidentRepository.countByStatus(IncidentStatus.RESOLVED);
        long closed = incidentRepository.countByStatus(IncidentStatus.CLOSED);
        long slaBreaches = incidentRepository.countSlaViolations();

        double complianceRate = total > 0
                ? ((double) (total - slaBreaches) / total) * 100.0
                : 100.0;
        complianceRate = Math.round(complianceRate * 100.0) / 100.0;

        Map<Priority, Long> countByPriority = new EnumMap<>(Priority.class);
        for (Priority p : Priority.values()) {
            countByPriority.put(p, incidentRepository.countByPriority(p));
        }

        Map<IncidentStatus, Long> countByStatus = new EnumMap<>(IncidentStatus.class);
        for (IncidentStatus s : IncidentStatus.values()) {
            countByStatus.put(s, incidentRepository.countByStatus(s));
        }

        return new IncidentOverviewReport(
                total,
                open,
                inProgress,
                resolved,
                closed,
                slaBreaches,
                complianceRate,
                countByPriority,
                countByStatus
        );
    }

    /**
     * Generates operational workload metrics for all support technicians,
     * including capacity utilization percentages and availability status.
     */
    public List<TechnicianWorkloadReport> generateTechnicianWorkloadReport() {
        List<Technician> technicians = technicianRepository.findAll();
        List<TechnicianWorkloadReport> reports = new ArrayList<>();

        for (Technician tech : technicians) {
            double utilization = tech.getMaxWorkload() > 0
                    ? ((double) tech.getActiveIncidentCount() / tech.getMaxWorkload()) * 100.0
                    : 0.0;
            utilization = Math.round(utilization * 100.0) / 100.0;

            reports.add(new TechnicianWorkloadReport(
                    tech.getId(),
                    tech.getFullName(),
                    tech.getExperienceLevel(),
                    tech.getMaxWorkload(),
                    tech.getActiveIncidentCount(),
                    tech.isAvailable(),
                    utilization
            ));
        }

        // Rank by active incident count descending
        reports.sort(Comparator.comparingInt(TechnicianWorkloadReport::activeIncidentCount).reversed());
        return reports;
    }

    /**
     * Generates reliability and incident volume analytics grouped by IT Service.
     */
    public List<ServiceAnalysisReport> generateServiceAnalysisReport() {
        List<ItService> services = itServiceRepository.findAll();
        List<Incident> allIncidents = incidentRepository.findAll();
        List<ServiceAnalysisReport> reports = new ArrayList<>();

        for (ItService service : services) {
            long total = 0;
            long active = 0;
            long breaches = 0;

            for (Incident incident : allIncidents) {
                if (incident.getAffectedService() != null &&
                        Objects.equals(incident.getAffectedService().getId(), service.getId())) {
                    total++;
                    if (incident.getStatus() != IncidentStatus.CLOSED && incident.getStatus() != IncidentStatus.RESOLVED) {
                        active++;
                    }
                    if (incident.getSlaTracking() != null && incident.getSlaTracking().isAnyBreached()) {
                        breaches++;
                    }
                }
            }

            reports.add(new ServiceAnalysisReport(
                    service.getId(),
                    service.getName(),
                    service.getBusinessCriticality(),
                    total,
                    active,
                    breaches
            ));
        }

        // Order by total incidents descending
        reports.sort(Comparator.comparingLong(ServiceAnalysisReport::totalIncidents).reversed());
        return reports;
    }

    /**
     * Exports a comprehensive operational incident CSV dataset.
     */
    public String exportIncidentsCsv() {
        List<Incident> incidents = incidentRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Incident ID,Title,Service,Category,Priority,Status,SLA Status,Escalation Level,Reporter,Technician,Created At,Resolved At\n");
        for (Incident inc : incidents) {
            csv.append(String.format("INC-%d,\"%s\",\"%s\",\"%s\",%s,%s,%s,%s,\"%s\",\"%s\",%s,%s\n",
                    inc.getId(),
                    inc.getTitle() != null ? inc.getTitle().replace("\"", "\"\"") : "",
                    inc.getAffectedService() != null ? inc.getAffectedService().getName() : "N/A",
                    inc.getCategory() != null ? inc.getCategory().getName() : "Unclassified",
                    inc.getPriority(),
                    inc.getStatus(),
                    inc.getSlaTracking() != null ? inc.getSlaTracking().getSlaStatus() : "N/A",
                    inc.getEscalationLevel(),
                    inc.getReporter() != null ? inc.getReporter().getFullName() : "N/A",
                    inc.getAssignedTechnician() != null ? inc.getAssignedTechnician().getFullName() : "Unassigned",
                    inc.getCreatedAt(),
                    inc.getSlaTracking() != null && inc.getSlaTracking().getResolvedAt() != null ? inc.getSlaTracking().getResolvedAt() : ""
            ));
        }
        return csv.toString();
    }
}
