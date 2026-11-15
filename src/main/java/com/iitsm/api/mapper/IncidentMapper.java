package com.iitsm.api.mapper;

import com.iitsm.api.dto.response.IncidentResponse;
import com.iitsm.api.dto.response.IncidentSummaryResponse;
import com.iitsm.api.dto.response.InvestigationNoteResponse;
import com.iitsm.domain.model.Incident;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class IncidentMapper {

    private final CatalogMapper catalogMapper;

    public IncidentMapper(CatalogMapper catalogMapper) {
        this.catalogMapper = catalogMapper;
    }

    public IncidentResponse toResponse(Incident incident) {
        if (incident == null) return null;

        IncidentResponse.UserBrief reporter = incident.getReporter() != null
                ? new IncidentResponse.UserBrief(
                        incident.getReporter().getId(),
                        incident.getReporter().getUsername(),
                        incident.getReporter().getFullName(),
                        incident.getReporter().getEmail())
                : null;

        IncidentResponse.ServiceBrief service = incident.getAffectedService() != null
                ? new IncidentResponse.ServiceBrief(
                        incident.getAffectedService().getId(),
                        incident.getAffectedService().getName(),
                        incident.getAffectedService().getBusinessCriticality())
                : null;

        IncidentResponse.CategoryBrief category = incident.getCategory() != null
                ? new IncidentResponse.CategoryBrief(
                        incident.getCategory().getId(),
                        incident.getCategory().getName())
                : null;

        IncidentResponse.TechnicianBrief technician = incident.getAssignedTechnician() != null
                ? new IncidentResponse.TechnicianBrief(
                        incident.getAssignedTechnician().getId(),
                        incident.getAssignedTechnician().getUsername(),
                        incident.getAssignedTechnician().getFullName(),
                        incident.getAssignedTechnician().getExperienceLevel())
                : null;

        IncidentResponse.SlaTrackingBrief slaTracking = null;
        if (incident.getSlaTracking() != null) {
            slaTracking = new IncidentResponse.SlaTrackingBrief(
                    incident.getSlaTracking().getResponseTargetMinutes(),
                    incident.getSlaTracking().getResolutionTargetMinutes(),
                    incident.getSlaTracking().getResponseDeadline(),
                    incident.getSlaTracking().getResolutionDeadline(),
                    incident.getSlaTracking().getRespondedAt(),
                    incident.getSlaTracking().getResolvedAt(),
                    incident.getSlaTracking().getClosedAt(),
                    incident.getSlaTracking().isResponseBreached(),
                    incident.getSlaTracking().isResolutionBreached(),
                    incident.getSlaTracking().getSlaStatus()
            );
        }

        IncidentResponse.ResolutionBrief resolution = null;
        if (incident.getResolution() != null && incident.getResolution().getSummary() != null) {
            resolution = new IncidentResponse.ResolutionBrief(
                    incident.getResolution().getResolvedById(),
                    incident.getResolution().getSummary(),
                    incident.getResolution().getRootCause(),
                    incident.getResolution().getSteps()
            );
        }

        IncidentResponse.FeedbackBrief feedback = null;
        if (incident.getFeedback() != null && incident.getFeedback().getRating() != null) {
            feedback = new IncidentResponse.FeedbackBrief(
                    incident.getFeedback().getRating(),
                    incident.getFeedback().getComment(),
                    incident.getFeedback().getSubmittedAt()
            );
        }

        List<InvestigationNoteResponse> noteResponses = incident.getNotes() != null
                ? incident.getNotes().stream().map(catalogMapper::toResponse).toList()
                : Collections.emptyList();

        List<Long> relatedIds = incident.getRelatedIncidents() != null
                ? incident.getRelatedIncidents().stream().map(Incident::getId).toList()
                : Collections.emptyList();

        return new IncidentResponse(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getImpact(),
                incident.getUrgency(),
                incident.getBusinessCriticality(),
                incident.getPriority(),
                incident.getPriorityScore(),
                incident.getStatus(),
                incident.getAffectedUserCount(),
                reporter,
                service,
                category,
                technician,
                slaTracking,
                resolution,
                feedback,
                noteResponses,
                relatedIds,
                incident.getAttachmentName(),
                incident.getAttachmentType(),
                incident.getAttachmentData(),
                incident.getEscalationLevel(),
                incident.getEscalatedAt(),
                incident.getEscalationReason(),
                incident.getCreatedAt(),
                incident.getUpdatedAt()
        );
    }

    public IncidentSummaryResponse toSummaryResponse(Incident incident) {
        if (incident == null) return null;

        String serviceName = incident.getAffectedService() != null ? incident.getAffectedService().getName() : null;
        String categoryName = incident.getCategory() != null ? incident.getCategory().getName() : null;
        String reporterName = incident.getReporter() != null ? incident.getReporter().getFullName() : null;
        String techName = incident.getAssignedTechnician() != null ? incident.getAssignedTechnician().getFullName() : null;
        com.iitsm.domain.enums.SlaStatus sla = incident.getSlaTracking() != null ? incident.getSlaTracking().getSlaStatus() : null;

        return new IncidentSummaryResponse(
                incident.getId(),
                incident.getTitle(),
                incident.getPriority(),
                incident.getStatus(),
                serviceName,
                categoryName,
                reporterName,
                techName,
                sla,
                incident.getEscalationLevel(),
                incident.getCreatedAt()
        );
    }
}
