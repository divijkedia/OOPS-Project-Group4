package com.iitsm.api.controller;

import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.IncidentOverviewReport;
import com.iitsm.api.dto.response.ServiceAnalysisReport;
import com.iitsm.api.dto.response.TechnicianWorkloadReport;
import com.iitsm.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller exposing management dashboards and operational analytics reports.
 */
@Tag(name = "Reports", description = "Operational dashboards, SLA compliance, and workload analytics")
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @Operation(summary = "Get Incident Overview Dashboard (Admin & Technicians)")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<IncidentOverviewReport>> getOverviewReport() {
        IncidentOverviewReport report = reportService.generateOverviewReport();
        return ResponseEntity.ok(ApiResponse.success(report, "Incident overview report retrieved"));
    }

    @Operation(summary = "Get Technician Workload and Capacity Report (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/technicians")
    public ResponseEntity<ApiResponse<List<TechnicianWorkloadReport>>> getTechnicianWorkloadReport() {
        List<TechnicianWorkloadReport> reports = reportService.generateTechnicianWorkloadReport();
        return ResponseEntity.ok(ApiResponse.success(reports, "Technician workload report retrieved"));
    }

    @Operation(summary = "Get IT Service Reliability and Impact Analysis Report (Admin & Technicians)")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceAnalysisReport>>> getServiceAnalysisReport() {
        List<ServiceAnalysisReport> reports = reportService.generateServiceAnalysisReport();
        return ResponseEntity.ok(ApiResponse.success(reports, "Service analysis report retrieved"));
    }

    @Operation(summary = "Export organization incidents operational report as CSV (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportIncidentsCsv() {
        String csv = reportService.exportIncidentsCsv();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"incident-report-" + java.time.LocalDate.now() + ".csv\"")
                .body(csv);
    }
}
