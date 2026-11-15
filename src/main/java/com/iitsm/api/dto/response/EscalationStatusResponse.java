package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.EscalationLevel;

import java.time.LocalDateTime;
import java.util.List;

public record EscalationStatusResponse(
        Long incidentId,
        EscalationLevel currentLevel,
        LocalDateTime escalatedAt,
        String escalationReason,
        boolean requiresEscalation,
        List<String> recommendations
) {
}
