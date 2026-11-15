package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.AuditAction;

import java.time.LocalDateTime;

public record AuditRecordResponse(
        Long id,
        LocalDateTime timestamp,
        Long userId,
        String username,
        AuditAction action,
        Long incidentId,
        String previousState,
        String newState,
        String description
) {
}
