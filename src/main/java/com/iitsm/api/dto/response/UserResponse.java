package com.iitsm.api.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Role;

import java.time.LocalDateTime;
import java.util.Set;

public record UserResponse(
        Long id,
        String username,
        String email,
        String fullName,
        Role role,
        boolean active,
        LocalDateTime createdAt,
        // Role-specific fields
        String department,
        String phone,
        ExperienceLevel experienceLevel,
        Integer maxWorkload,
        Integer activeIncidentCount,
        Boolean available,
        Set<String> skills
) {

    @JsonProperty("activeIncidentsCount")
    public Integer activeIncidentsCount() {
        return activeIncidentCount;
    }
}
