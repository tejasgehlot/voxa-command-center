package com.voxa.dto.response;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class NotificationPageResponse {
    private List<NotificationResponse> notifications;
    private Integer                    unreadCount;
}