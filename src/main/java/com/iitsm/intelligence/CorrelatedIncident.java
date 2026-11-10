package com.iitsm.intelligence;

import com.iitsm.domain.enums.Priority;

import java.time.LocalDateTime;

/**
 * Value object representing an incident correlated to a target ticket,
 * along with the matching vector, composite correlation score, and human-readable rationale.
 */
public record CorrelatedIncident(
        Long incidentId,
        String title,
        String serviceName,
        String categoryName,
        String status,
        Priority priority,
        int affectedUserCount,
        LocalDateTime createdAt,
        CorrelationType correlationType,
        double correlationScore,
        String sharedComponent,
        String rationale
) {
}
