package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationResponse {
    private UUID          notifId;
    private String        type;
    private String        title;
    private String        body;
    private UUID          complaintId;
    private Boolean       read;
    private LocalDateTime createdAt;
}