package com.iitsm.api.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.iitsm.domain.enums.ExperienceLevel;

/**
 * DTO representing technician workload distribution, active commitments, and capacity utilization.
 */
public record TechnicianWorkloadReport(
        Long technicianId,
        String fullName,
        ExperienceLevel experienceLevel,
        int maxWorkload,
        int activeIncidentCount,
        boolean available,
        double utilizationPercentage
) {

    @JsonProperty("technicianName")
    public String technicianName() {
        return fullName;
    }
}
