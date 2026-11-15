package com.iitsm.api.controller;

import com.iitsm.api.dto.request.AddNoteRequest;
import com.iitsm.api.dto.request.AssignTechnicianRequest;
import com.iitsm.api.dto.request.BatchResolveIncidentsRequest;
import com.iitsm.api.dto.request.ClassifyIncidentRequest;
import com.iitsm.api.dto.request.CreateIncidentRequest;
import com.iitsm.api.dto.request.EscalateIncidentRequest;
import com.iitsm.api.dto.request.FeedbackRequest;
import com.iitsm.api.dto.request.ReopenIncidentRequest;
import com.iitsm.api.dto.request.ResolveIncidentRequest;
import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.BatchResolveResponse;
import com.iitsm.api.dto.response.EscalationStatusResponse;
import com.iitsm.api.dto.response.IncidentResponse;
import com.iitsm.api.dto.response.IncidentSummaryResponse;
import com.iitsm.api.mapper.IncidentMapper;
import com.iitsm.domain.enums.EscalationLevel;
import com.iitsm.domain.enums.IncidentStatus;
import com.iitsm.domain.enums.Priority;
import com.iitsm.domain.enums.Role;
import com.iitsm.domain.enums.SlaStatus;
import com.iitsm.domain.exception.UnauthorizedOperationException;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.Technician;
import com.iitsm.domain.model.User;
import com.iitsm.intelligence.AutoEscalationService;
import com.iitsm.security.SecurityUser;
import com.iitsm.service.IncidentService;
import com.iitsm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * Controller exposing REST endpoints for core incident operations across the ITIL lifecycle.
 */
@Tag(name = "Incident Management", description = "Create, view, classify, assign, resolve, verify, and close incidents")
@RestController
@RequestMapping("/api/incidents")
@Transactional
public class IncidentController {

    private final IncidentService incidentService;
    private final UserService userService;
    private final IncidentMapper incidentMapper;
    private final com.iitsm.intelligence.SmartTechnicianRecommender smartTechnicianRecommender;
    private final com.iitsm.intelligence.DuplicateDetector duplicateDetector;
    private final AutoEscalationService autoEscalationService;

    public IncidentController(IncidentService incidentService,
                              UserService userService,
                              IncidentMapper incidentMapper,
                              com.iitsm.intelligence.SmartTechnicianRecommender smartTechnicianRecommender,
                              com.iitsm.intelligence.DuplicateDetector duplicateDetector,
                              AutoEscalationService autoEscalationService) {
        this.incidentService = incidentService;
        this.userService = userService;
        this.incidentMapper = incidentMapper;
        this.smartTechnicianRecommender = smartTechnicianRecommender;
        this.duplicateDetector = duplicateDetector;
        this.autoEscalationService = autoEscalationService;
    }

    @Operation(summary = "Report a new incident (Employees & Admins)")
    @PostMapping
    public ResponseEntity<ApiResponse<IncidentResponse>> createIncident(
            @Valid @RequestBody CreateIncidentRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        int affectedUsers = request.affectedUserCount() != null ? request.affectedUserCount() : 1;
        Incident incident = incidentService.createIncident(
                request.title(),
                request.description(),
                currentUser.getId(),
                request.serviceId(),
                request.categoryId(),
                request.impact(),
                request.urgency(),
                affectedUsers,
                request.attachmentName(),
                request.attachmentType(),
                request.attachmentData()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(incidentMapper.toResponse(incident), "Incident reported successfully"));
    }

    @Operation(summary = "Get detailed information for a specific incident")
    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncidentById(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.getIncidentById(id);
        enforceReadAccess(incident, currentUser);

        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident)));
    }

    @Operation(summary = "List and search incidents with multi-criteria filtering, sorting, and pagination")
    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<ApiResponse<List<IncidentSummaryResponse>>> listIncidents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long serviceId,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) Long reporterId,
            @RequestParam(required = false) SlaStatus slaStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @AuthenticationPrincipal SecurityUser currentUser) {

        User user = userService.getUserById(currentUser.getId());
        Long effectiveReporterId = reporterId;
        Long effectiveTechnicianId = technicianId;

        // Role-based visibility enforcement
        if (user instanceof Employee && user.getRole() == Role.EMPLOYEE) {
            effectiveReporterId = user.getId();
        } else if (user instanceof Technician && user.getRole() == Role.TECHNICIAN && effectiveTechnicianId == null && effectiveReporterId == null) {
            effectiveTechnicianId = user.getId();
        }

        Sort sortOrder = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<Incident> pageResult = incidentService.searchIncidents(
                search, status, priority, categoryId, serviceId,
                effectiveTechnicianId, effectiveReporterId, slaStatus,
                from, to, pageable
        );

        List<IncidentSummaryResponse> dtos = pageResult.getContent().stream()
                .map(incidentMapper::toSummaryResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] parts = sort.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = parts.length > 1 && parts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }

    @Operation(summary = "Classify an incident by category (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/classify")
    public ResponseEntity<ApiResponse<IncidentResponse>> classifyIncident(
            @PathVariable Long id,
            @Valid @RequestBody ClassifyIncidentRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.classifyIncident(id, request.categoryId(), currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Incident classified"));
    }

    @Operation(summary = "Assign a support technician (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<IncidentResponse>> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.assignTechnician(id, request.technicianId(), currentUser.getId());
        String message = request.technicianId() != null ? "Technician assigned" : "Technician unassigned";
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), message));
    }

    @Operation(summary = "Unassign a support technician completely (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/unassign")
    public ResponseEntity<ApiResponse<IncidentResponse>> unassignTechnician(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.unassignTechnician(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Technician unassigned"));
    }

    @Operation(summary = "Unassign a support technician completely via DELETE (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<IncidentResponse>> deleteTechnicianAssignment(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.unassignTechnician(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Technician unassigned"));
    }

    @Operation(summary = "Acknowledge assigned incident (Technician)")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<IncidentResponse>> acknowledgeIncident(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.acknowledgeIncident(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Incident acknowledged"));
    }

    @Operation(summary = "Start active investigation (Technician)")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @PutMapping("/{id}/start")
    public ResponseEntity<ApiResponse<IncidentResponse>> startInvestigation(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.startInvestigation(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Investigation started"));
    }

    @Operation(summary = "Add an investigation progress or diagnostic note")
    @PostMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<IncidentResponse>> addInvestigationNote(
            @PathVariable Long id,
            @Valid @RequestBody AddNoteRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        User author = userService.getUserById(currentUser.getId());
        Incident incident = incidentService.addInvestigationNote(
                id, author, request.content(), request.attachmentName(), request.attachmentType(), request.attachmentData()
        );
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Note added"));
    }

    @Operation(summary = "Submit resolution findings and mark incident as RESOLVED (Technician), optionally resolving correlated tickets")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @PutMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<IncidentResponse>> resolveIncident(
            @PathVariable Long id,
            @Valid @RequestBody ResolveIncidentRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.resolveIncident(
                id, currentUser.getId(), request.summary(), request.rootCause(), request.steps(),
                request.correlatedIncidentIds()
        );
        int correlatedCount = request.correlatedIncidentIds() != null ? request.correlatedIncidentIds().size() : 0;
        String message = correlatedCount > 0
                ? String.format("Incident resolved along with %d correlated incident(s)", correlatedCount)
                : "Incident resolved";
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), message));
    }

    @Operation(summary = "Batch resolve multiple incidents reporting the same root issue")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    @PostMapping("/batch-resolve")
    public ResponseEntity<ApiResponse<BatchResolveResponse>> batchResolveIncidents(
            @Valid @RequestBody BatchResolveIncidentsRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        List<Incident> resolvedList = incidentService.batchResolveIncidents(
                request.incidentIds(), currentUser.getId(), request.summary(), request.rootCause(), request.steps()
        );
        List<Long> resolvedIds = resolvedList.stream().map(Incident::getId).toList();
        String message = String.format("Successfully batch-resolved %d incident(s) reporting the same issue", resolvedList.size());
        BatchResolveResponse response = new BatchResolveResponse(
                resolvedList.size(),
                resolvedIds,
                request.summary(),
                message
        );
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    @Operation(summary = "Confirm and verify resolution")
    @PutMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<IncidentResponse>> verifyIncident(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.verifyIncident(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Resolution verified"));
    }

    @Operation(summary = "Formally close an incident (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<IncidentResponse>> closeIncident(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.closeIncident(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Incident closed"));
    }

    @Operation(summary = "Reopen a resolved or closed incident")
    @PutMapping("/{id}/reopen")
    public ResponseEntity<ApiResponse<IncidentResponse>> reopenIncident(
            @PathVariable Long id,
            @Valid @RequestBody ReopenIncidentRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.reopenIncident(id, currentUser.getId(), request.reason());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Incident reopened"));
    }

    @Operation(summary = "Submit satisfaction feedback for a resolved incident (Reporter)")
    @PostMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<IncidentResponse>> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.submitFeedback(id, currentUser.getId(), request.rating(), request.comment());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(incident), "Feedback submitted"));
    }

    @Operation(summary = "Get multi-factor smart technician recommendations for incident assignment (Admin & Technicians)")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<ApiResponse<List<com.iitsm.intelligence.TechnicianRecommendation>>> getRecommendations(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.getIncidentById(id);
        List<com.iitsm.intelligence.TechnicianRecommendation> recommendations = smartTechnicianRecommender.recommendTechnicians(incident);
        return ResponseEntity.ok(ApiResponse.success(recommendations, "Technician recommendations generated"));
    }

    @Operation(summary = "Find correlated and potential duplicate incidents")
    @GetMapping("/{id}/duplicates")
    public ResponseEntity<ApiResponse<List<com.iitsm.intelligence.DuplicateMatch>>> getDuplicates(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.getIncidentById(id);
        enforceReadAccess(incident, currentUser);
        List<com.iitsm.intelligence.DuplicateMatch> duplicates = duplicateDetector.findDuplicates(incident);
        return ResponseEntity.ok(ApiResponse.success(duplicates, "Duplicate matches detected"));
    }

    @Operation(summary = "Detect enterprise-wide active outage clusters and root causes across infrastructure")
    @GetMapping("/correlations/clusters")
    public ResponseEntity<ApiResponse<List<com.iitsm.intelligence.OutageCluster>>> getActiveClusters() {
        List<com.iitsm.intelligence.OutageCluster> clusters = incidentService.getActiveOutageClusters();
        return ResponseEntity.ok(ApiResponse.success(clusters, "Active outage clusters detected"));
    }

    @Operation(summary = "Perform multi-vector correlation and root-cause blast radius analysis for an incident")
    @GetMapping("/{id:[0-9]+}/correlations")
    public ResponseEntity<ApiResponse<com.iitsm.intelligence.IncidentCorrelationReport>> getCorrelations(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.getIncidentById(id);
        enforceReadAccess(incident, currentUser);
        com.iitsm.intelligence.IncidentCorrelationReport report = incidentService.getIncidentCorrelations(id);
        return ResponseEntity.ok(ApiResponse.success(report, "Incident correlations analyzed"));
    }

    @Operation(summary = "Manually escalate an incident to a higher tier or next level")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @PostMapping("/{id}/escalate")
    public ResponseEntity<ApiResponse<IncidentResponse>> escalateIncident(
            @PathVariable Long id,
            @RequestBody(required = false) EscalateIncidentRequest request,
            @AuthenticationPrincipal SecurityUser currentUser) {

        EscalationLevel targetLevel = (request != null) ? request.targetLevel() : null;
        String reason = (request != null) ? request.reason() : null;
        Incident escalated = autoEscalationService.escalateIncident(id, targetLevel, reason, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(incidentMapper.toResponse(escalated), "Incident escalated successfully"));
    }

    @Operation(summary = "Get escalation status, recommendations, and risk indicators")
    @GetMapping("/{id}/escalation")
    public ResponseEntity<ApiResponse<EscalationStatusResponse>> getEscalationStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Incident incident = incidentService.getIncidentById(id);
        enforceReadAccess(incident, currentUser);

        boolean requiresEscalation = autoEscalationService.shouldEscalate(incident);
        List<String> recommendations = autoEscalationService.getEscalationRecommendations(incident);

        EscalationStatusResponse response = new EscalationStatusResponse(
                incident.getId(),
                incident.getEscalationLevel(),
                incident.getEscalatedAt(),
                incident.getEscalationReason(),
                requiresEscalation,
                recommendations
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Escalation status retrieved"));
    }

    private void enforceReadAccess(Incident incident, SecurityUser currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        boolean isReporter = incident.getReporter() != null &&
                Objects.equals(incident.getReporter().getId(), currentUser.getId());
        boolean isTechnician = incident.getAssignedTechnician() != null &&
                Objects.equals(incident.getAssignedTechnician().getId(), currentUser.getId());

        if (!isReporter && !isTechnician) {
            throw new UnauthorizedOperationException("You do not have permission to view incident INC-" + incident.getId());
        }
    }
}
