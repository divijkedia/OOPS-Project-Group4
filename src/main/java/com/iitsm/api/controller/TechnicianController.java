package com.iitsm.api.controller;

import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.IncidentSummaryResponse;
import com.iitsm.api.dto.response.UserResponse;
import com.iitsm.api.mapper.IncidentMapper;
import com.iitsm.api.mapper.UserMapper;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.Technician;
import com.iitsm.security.SecurityUser;
import com.iitsm.service.IncidentService;
import com.iitsm.service.TechnicianService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Technician Portal", description = "Endpoints tailored for technical engineers managing their assigned queue and workload")
@RestController
@RequestMapping("/api/technician")
@PreAuthorize("hasRole('TECHNICIAN')")
@Transactional
public class TechnicianController {

    private final IncidentService incidentService;
    private final TechnicianService technicianService;
    private final IncidentMapper incidentMapper;
    private final UserMapper userMapper;

    public TechnicianController(IncidentService incidentService,
                                TechnicianService technicianService,
                                IncidentMapper incidentMapper,
                                UserMapper userMapper) {
        this.incidentService = incidentService;
        this.technicianService = technicianService;
        this.incidentMapper = incidentMapper;
        this.userMapper = userMapper;
    }

    @Operation(summary = "View incidents assigned to the authenticated technician")
    @GetMapping("/incidents")
    public ResponseEntity<ApiResponse<List<IncidentSummaryResponse>>> getMyAssignedIncidents(
            @AuthenticationPrincipal SecurityUser currentUser) {

        Technician technician = technicianService.getTechnicianById(currentUser.getId());
        List<Incident> incidents = incidentService.findMyAssignedIncidents(technician);

        List<IncidentSummaryResponse> dtos = incidents.stream()
                .map(incidentMapper::toSummaryResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @Operation(summary = "View current active incident count and capacity workload")
    @GetMapping("/workload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyWorkload(
            @AuthenticationPrincipal SecurityUser currentUser) {

        Technician technician = technicianService.getTechnicianById(currentUser.getId());

        Map<String, Object> workload = Map.of(
                "technicianId", technician.getId(),
                "fullName", technician.getFullName(),
                "experienceLevel", technician.getExperienceLevel(),
                "activeIncidentCount", technician.getActiveIncidentCount(),
                "maxWorkload", technician.getMaxWorkload(),
                "available", technician.isAvailable(),
                "capacityRemaining", Math.max(0, technician.getMaxWorkload() - technician.getActiveIncidentCount())
        );

        return ResponseEntity.ok(ApiResponse.success(workload));
    }

    @Operation(summary = "Toggle technician availability (on-duty / off-duty)")
    @PutMapping("/availability")
    public ResponseEntity<ApiResponse<UserResponse>> setAvailability(
            @RequestParam boolean available,
            @AuthenticationPrincipal SecurityUser currentUser) {

        Technician updated = technicianService.updateAvailability(currentUser.getId(), available);
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(updated), "Availability updated"));
    }
}
