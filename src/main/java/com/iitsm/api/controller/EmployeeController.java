package com.iitsm.api.controller;

import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.IncidentSummaryResponse;
import com.iitsm.api.dto.response.NotificationResponse;
import com.iitsm.api.mapper.CatalogMapper;
import com.iitsm.api.mapper.IncidentMapper;
import com.iitsm.domain.model.Employee;
import com.iitsm.domain.model.Incident;
import com.iitsm.domain.model.Notification;
import com.iitsm.security.SecurityUser;
import com.iitsm.service.IncidentService;
import com.iitsm.service.NotificationService;
import com.iitsm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Employee Portal", description = "Endpoints tailored for end-user employees reporting and tracking incidents")
@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasRole('EMPLOYEE')")
@Transactional(readOnly = true)
public class EmployeeController {

    private final IncidentService incidentService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final IncidentMapper incidentMapper;
    private final CatalogMapper catalogMapper;

    public EmployeeController(IncidentService incidentService,
                              UserService userService,
                              NotificationService notificationService,
                              IncidentMapper incidentMapper,
                              CatalogMapper catalogMapper) {
        this.incidentService = incidentService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.incidentMapper = incidentMapper;
        this.catalogMapper = catalogMapper;
    }

    @Operation(summary = "View incidents submitted by the authenticated employee")
    @GetMapping("/incidents")
    public ResponseEntity<ApiResponse<List<IncidentSummaryResponse>>> getMyReportedIncidents(
            @AuthenticationPrincipal SecurityUser currentUser) {

        Employee employee = userService.getEmployeeById(currentUser.getId());
        List<Incident> incidents = incidentService.findMyReportedIncidents(employee);

        List<IncidentSummaryResponse> dtos = incidents.stream()
                .map(incidentMapper::toSummaryResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @Operation(summary = "Get notifications for the authenticated employee")
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal SecurityUser currentUser) {

        List<Notification> notifications = notificationService.getNotificationsForUser(currentUser.getId());
        List<NotificationResponse> dtos = notifications.stream()
                .map(catalogMapper::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
}
