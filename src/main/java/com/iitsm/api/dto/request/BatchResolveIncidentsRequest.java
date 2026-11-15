package com.iitsm.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BatchResolveIncidentsRequest(
        @NotEmpty(message = "At least one incident ID must be specified")
        List<Long> incidentIds,

        @NotBlank(message = "Resolution summary is required")
        String summary,

        @NotBlank(message = "Root cause analysis is required")
        String rootCause,

        @NotBlank(message = "Remediation steps are required")
        String steps
) {
}
