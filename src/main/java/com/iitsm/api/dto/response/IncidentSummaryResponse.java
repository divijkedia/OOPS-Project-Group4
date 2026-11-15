package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.SlaStatus;

import java.time.LocalDateTime;

public record IncidentSummaryResponse(
        Long id,
        String title,
        Priority priority,
        IncidentStatus status,
        String serviceName,
        String categoryName,
        String reporterName,
        String technicianName,
        SlaStatus slaStatus,
        EscalationLevel escalationLevel,
        LocalDateTime createdAt
) {
}
