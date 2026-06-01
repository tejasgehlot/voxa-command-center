package com.voxa.service;

import com.voxa.dto.response.NotificationPageResponse;
import com.voxa.dto.response.NotificationResponse;
import com.voxa.entity.Notification;
import com.voxa.exception.BadRequestException;
import com.voxa.exception.ResourceNotFoundException;
import com.voxa.repository.NotificationRepository;
import com.voxa.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SecurityUtil           securityUtil;

    public NotificationPageResponse getNotifications(boolean unreadOnly, int size) {
        UUID     userId   = securityUtil.getCurrentUserId();
        Pageable pageable = PageRequest.of(0, size,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Notification> page = unreadOnly
                ? notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                : notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);

        long unreadCount = notificationRepository
                .countByUserIdAndIsReadFalse(userId);

        return new NotificationPageResponse(
                page.map(this::toResponse).getContent(),
                (int) unreadCount
        );
    }

    public NotificationResponse markAsRead(UUID notifId) {
        UUID userId = securityUtil.getCurrentUserId();

        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found"
                ));

        if (!notif.getUser().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        notif.setIsRead(true);
        notif = notificationRepository.save(notif);
        return toResponse(notif);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .notifId(n.getId()).type(n.getType().name())
                .title(n.getTitle()).body(n.getBody())
                .complaintId(n.getComplaintId()).read(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}