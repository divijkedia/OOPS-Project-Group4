package com.iitsm.api.dto.request;

import com.iitsm.domain.enums.EscalationLevel;

public record EscalateIncidentRequest(
        EscalationLevel targetLevel,
        String reason
) {
}
