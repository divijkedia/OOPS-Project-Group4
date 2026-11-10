package com.iitsm.intelligence;

import com.iitsm.domain.enums.Priority;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Value object representing an enterprise-wide active outage cluster,
 * grouping correlated incidents across shared services or upstream dependencies.
 */
public record OutageCluster(
        String clusterId,
        String sharedComponent,
        String rootCauseHypothesis,
        int incidentCount,
        int totalAffectedUsers,
        Priority highestPriority,
        LocalDateTime detectedAt,
        List<Long> incidentIds,
        List<String> affectedServiceNames
) {
}
