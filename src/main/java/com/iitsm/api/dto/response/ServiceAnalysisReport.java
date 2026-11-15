package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.BusinessCriticality;

/**
 * DTO representing incident frequency and SLA reliability per affected IT service.
 */
public record ServiceAnalysisReport(
        Long serviceId,
        String serviceName,
        BusinessCriticality businessCriticality,
        long totalIncidents,
        long activeIncidents,
        long slaBreaches
) {
}
