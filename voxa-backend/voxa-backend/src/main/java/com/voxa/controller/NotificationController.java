package com.voxa.controller;

import com.voxa.dto.response.NotificationPageResponse;
import com.voxa.dto.response.NotificationResponse;
import com.voxa.service.NotificationService;
import com.voxa.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationPageResponse>> getNotifications(
            @RequestParam(defaultValue = "true") boolean unreadOnly,
            @RequestParam(defaultValue = "20")   int     size) {

        return ResponseEntity.ok(ApiResponse.success("Notifications fetched",
                notificationService.getNotifications(unreadOnly, size)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable UUID id) {

        return ResponseEntity.ok(ApiResponse.success(
                "Notification marked as read",
                notificationService.markAsRead(id)));
    }
}