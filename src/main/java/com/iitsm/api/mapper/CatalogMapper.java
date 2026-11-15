package com.iitsm.api.mapper;

import com.iitsm.api.dto.response.AuditRecordResponse;
import com.iitsm.api.dto.response.CategoryResponse;
import com.iitsm.api.dto.response.InvestigationNoteResponse;
import com.iitsm.api.dto.response.ItServiceResponse;
import com.iitsm.api.dto.response.NotificationResponse;
import com.iitsm.api.dto.response.SlaPolicyResponse;
import com.iitsm.domain.model.AuditRecord;
import com.iitsm.domain.model.IncidentCategory;
import com.iitsm.domain.model.InvestigationNote;
import com.iitsm.domain.model.ItService;
import com.iitsm.domain.model.Notification;
import com.iitsm.domain.model.SlaPolicy;
import org.springframework.stereotype.Component;

@Component
public class CatalogMapper {

    public ItServiceResponse toResponse(ItService service) {
        if (service == null) return null;
        return new ItServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getBusinessCriticality(),
                service.isActive()
        );
    }

    public CategoryResponse toResponse(IncidentCategory category) {
        if (category == null) return null;
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getKeywords()
        );
    }

    public SlaPolicyResponse toResponse(SlaPolicy policy) {
        if (policy == null) return null;
        Long serviceId = policy.getItService() != null ? policy.getItService().getId() : null;
        String serviceName = policy.getItService() != null ? policy.getItService().getName() : "GLOBAL";
        return new SlaPolicyResponse(
                policy.getId(),
                policy.getPriority(),
                serviceId,
                serviceName,
                policy.getResponseTargetMinutes(),
                policy.getResolutionTargetMinutes(),
                policy.isGlobal()
        );
    }

    public AuditRecordResponse toResponse(AuditRecord record) {
        if (record == null) return null;
        return new AuditRecordResponse(
                record.getId(),
                record.getTimestamp(),
                record.getUserId(),
                record.getUsername(),
                record.getAction(),
                record.getIncidentId(),
                record.getPreviousState(),
                record.getNewState(),
                record.getDescription()
        );
    }

    public NotificationResponse toResponse(Notification notification) {
        if (notification == null) return null;
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipientId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getChannel(),
                notification.getCreatedAt(),
                notification.isRead(),
                notification.getIncidentId()
        );
    }

    public InvestigationNoteResponse toResponse(InvestigationNote note) {
        if (note == null) return null;
        return new InvestigationNoteResponse(
                note.getId(),
                note.getIncident().getId(),
                note.getAuthor().getId(),
                note.getAuthor().getFullName(),
                note.getContent(),
                note.getAttachmentName(),
                note.getAttachmentType(),
                note.getAttachmentData(),
                note.getCreatedAt()
        );
    }
}
