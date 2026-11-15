package com.iitsm.api.dto.request;

import com.iitsm.domain.enums.BusinessCriticality;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateServiceRequest(
        @NotBlank(message = "Service name is required")
        @Size(max = 100, message = "Service name cannot exceed 100 characters")
        String name,

        String description,

        @NotNull(message = "Business criticality is required")
        BusinessCriticality businessCriticality
) {
}
