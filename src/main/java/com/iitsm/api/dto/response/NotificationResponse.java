package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.NotificationChannel;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long recipientId,
        String type,
        String title,
        String message,
        NotificationChannel channel,
        LocalDateTime createdAt,
        boolean read,
        Long incidentId
) {
}
