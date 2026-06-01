package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EscalateResponse {
    private UUID          complaintId;
    private Boolean       escalated;
    private LocalDateTime escalatedAt;
}