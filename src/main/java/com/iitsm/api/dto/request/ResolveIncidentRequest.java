package com.iitsm.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ResolveIncidentRequest(
        @NotBlank(message = "Resolution summary is required")
        String summary,

        @NotBlank(message = "Root cause analysis is required")
        String rootCause,

        @NotBlank(message = "Remediation steps are required")
        String steps,

        List<Long> correlatedIncidentIds
) {
    public ResolveIncidentRequest(String summary, String rootCause, String steps) {
        this(summary, rootCause, steps, null);
    }
}
