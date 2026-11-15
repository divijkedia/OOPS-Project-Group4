package com.iitsm.api.controller;

import com.iitsm.api.dto.response.ApiResponse;
import com.iitsm.api.dto.response.NotificationResponse;
import com.iitsm.api.mapper.CatalogMapper;
import com.iitsm.domain.model.Notification;
import com.iitsm.security.SecurityUser;
import com.iitsm.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Notifications", description = "User notification feed and read receipts")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CatalogMapper catalogMapper;

    public NotificationController(NotificationService notificationService,
                                  CatalogMapper catalogMapper) {
        this.notificationService = notificationService;
        this.catalogMapper = catalogMapper;
    }

    @Operation(summary = "Get notification feed for the current user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal SecurityUser currentUser) {

        List<Notification> notifications = notificationService.getNotificationsForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications.stream().map(catalogMapper::toResponse).toList()));
    }

    @Operation(summary = "Get unread notifications count for the current user")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal SecurityUser currentUser) {

        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @Operation(summary = "Mark a notification as read")
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.message("Notification marked as read"));
    }

    @Operation(summary = "Mark all notifications as read for current user")
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal SecurityUser currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.message("All notifications marked as read"));
    }
}
