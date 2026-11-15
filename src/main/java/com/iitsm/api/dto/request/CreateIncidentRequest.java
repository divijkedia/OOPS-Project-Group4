package com.iitsm.api.dto.request;

import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.Urgency;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateIncidentRequest(
        @NotBlank(message = "Incident title is required")
        @Size(max = 200, message = "Title cannot exceed 200 characters")
        String title,

        @NotBlank(message = "Incident description is required")
        String description,

        @NotNull(message = "Affected IT Service ID is required")
        Long serviceId,

        Long categoryId, // Optional: if omitted, auto-classification via keywords occurs

        @NotNull(message = "Impact is required")
        Impact impact,

        @NotNull(message = "Urgency is required")
        Urgency urgency,

        @Min(value = 1, message = "Affected user count must be at least 1")
        Integer affectedUserCount,

        String attachmentName,
        String attachmentType,
        String attachmentData
) {
    public CreateIncidentRequest(String title, String description, Long serviceId, Long categoryId,
                                 Impact impact, Urgency urgency, Integer affectedUserCount) {
        this(title, description, serviceId, categoryId, impact, urgency, affectedUserCount, null, null, null);
    }
}
