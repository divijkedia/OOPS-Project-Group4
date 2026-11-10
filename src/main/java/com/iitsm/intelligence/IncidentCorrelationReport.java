package com.iitsm.intelligence;

import com.iitsm.domain.enums.Priority;

import java.util.List;

/**
 * Diagnostic analysis report detailing correlated incidents, systemic blast radius,
 * and probable root cause component for a target incident.
 */
public record IncidentCorrelationReport(
        Long targetIncidentId,
        String targetServiceName,
        int totalCorrelatedCount,
        int blastRadiusUserCount,
        int impactedServicesCount,
        String probableRootCause,
        Priority highestPriorityInCluster,
        List<CorrelatedIncident> correlations
) {
}
