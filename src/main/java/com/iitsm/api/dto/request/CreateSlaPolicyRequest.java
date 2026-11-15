package com.iitsm.api.dto.request;

import com.iitsm.domain.enums.Priority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateSlaPolicyRequest(
        @NotNull(message = "Priority is required")
        Priority priority,

        Long serviceId, // Null for global default policy

        @NotNull(message = "Response target minutes is required")
        @Min(value = 1, message = "Response target must be at least 1 minute")
        Integer responseTargetMinutes,

        @NotNull(message = "Resolution target minutes is required")
        @Min(value = 1, message = "Resolution target must be at least 1 minute")
        Integer resolutionTargetMinutes
) {
}
