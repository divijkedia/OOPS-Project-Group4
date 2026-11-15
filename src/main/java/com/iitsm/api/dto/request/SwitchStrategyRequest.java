package com.iitsm.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SwitchStrategyRequest(
        @NotBlank(message = "Strategy name is required (e.g. SKILL_BASED, LOAD_BASED, ROUND_ROBIN)")
        String strategyName
) {
}
