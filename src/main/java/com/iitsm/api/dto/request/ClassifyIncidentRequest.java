package com.iitsm.api.dto.request;

import jakarta.validation.constraints.NotNull;

public record ClassifyIncidentRequest(
        @NotNull(message = "Category ID is required")
        Long categoryId
) {
}
