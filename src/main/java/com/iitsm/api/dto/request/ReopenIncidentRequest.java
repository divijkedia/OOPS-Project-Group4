package com.iitsm.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ReopenIncidentRequest(
        @NotBlank(message = "Reason for reopening the incident is required")
        String reason
) {
}
