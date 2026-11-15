package com.iitsm.api.dto.response;

import com.iitsm.domain.enums.BusinessCriticality;
import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.ExperienceLevel;
import com.iitsm.domain.enums.Impact;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.enums.Urgency;

import java.time.LocalDateTime;
import java.util.List;

public record IncidentResponse(
        Long id,
        String title,
        String description,
        Impact impact,
        Urgency urgency,
        BusinessCriticality businessCriticality,
        Priority priority,
        int priorityScore,
        IncidentStatus status,
        int affectedUserCount,

        // Associated Entities
        UserBrief reporter,
        ServiceBrief service,
        CategoryBrief category,
        TechnicianBrief assignedTechnician,

        // Embedded Value Objects
        SlaTrackingBrief slaTracking,
        ResolutionBrief resolution,
        FeedbackBrief feedback,

        // Diagnostics & Related
        List<InvestigationNoteResponse> notes,
        List<Long> relatedIncidentIds,

        // Attachments
        String attachmentName,
        String attachmentType,
        String attachmentData,

        // Tiered Escalation
        EscalationLevel escalationLevel,
        LocalDateTime escalatedAt,
        String escalationReason,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record UserBrief(Long id, String username, String fullName, String email) {}
    public record ServiceBrief(Long id, String name, BusinessCriticality businessCriticality) {}
    public record CategoryBrief(Long id, String name) {}
    public record TechnicianBrief(Long id, String username, String fullName, ExperienceLevel experienceLevel) {}

    public record SlaTrackingBrief(
            Integer responseTargetMinutes,
            Integer resolutionTargetMinutes,
            LocalDateTime responseDeadline,
            LocalDateTime resolutionDeadline,
            LocalDateTime respondedAt,
            LocalDateTime resolvedAt,
            LocalDateTime closedAt,
            boolean responseBreached,
            boolean resolutionBreached,
            SlaStatus slaStatus
    ) {}

    public record ResolutionBrief(
            Long resolvedById,
            String summary,
            String rootCause,
            String steps
    ) {}

    public record FeedbackBrief(
            Integer rating,
            String comment,
            LocalDateTime submittedAt
    ) {}
}
