package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ActivityLogResponse {
    private UUID          logId;
    private UUID          userId;
    private String        userName;
    private String        role;
    private String        action;
    private UUID          complaintId;
    private String        detail;
    private LocalDateTime performedAt;
}