package com.iitsm.api.controller;

import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.AuditRecordResponse;
import com.iitsm.api.mapper.CatalogMapper;
import com.iitsm.domain.model.AuditRecord;
import com.iitsm.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Audit Trail", description = "Query immutable incident history and compliance audit logs")
@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;
    private final CatalogMapper catalogMapper;

    public AuditController(AuditService auditService, CatalogMapper catalogMapper) {
        this.auditService = auditService;
        this.catalogMapper = catalogMapper;
    }

    @Operation(summary = "Get full historical audit log for a specific incident")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/incidents/{incidentId}")
    public ResponseEntity<ApiResponse<List<AuditRecordResponse>>> getIncidentAuditTrail(@PathVariable Long incidentId) {
        List<AuditRecord> records = auditService.getAuditTrailForIncident(incidentId);
        return ResponseEntity.ok(ApiResponse.success(records.stream().map(catalogMapper::toResponse).toList()));
    }

    @Operation(summary = "Get organization-wide audit trail of all incident actions (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditRecordResponse>>> getAllAuditRecords() {
        List<AuditRecord> records = auditService.getAllAuditRecords();
        return ResponseEntity.ok(ApiResponse.success(records.stream().map(catalogMapper::toResponse).toList()));
    }
}
