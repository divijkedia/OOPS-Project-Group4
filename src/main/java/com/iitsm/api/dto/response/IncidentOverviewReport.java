package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;

import java.util.Map;

/**
 * DTO representing aggregate system-wide incident statistics and SLA compliance.
 */
public record IncidentOverviewReport(
        long totalIncidents,
        long openIncidents,
        long inProgressIncidents,
        long resolvedIncidents,
        long closedIncidents,
        long slaBreaches,
        double slaComplianceRatePercent,
        Map<Priority, Long> countByPriority,
        Map<IncidentStatus, Long> countByStatus
) {
}
