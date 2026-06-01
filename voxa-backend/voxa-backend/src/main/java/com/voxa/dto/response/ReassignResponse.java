package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReassignResponse {
    private UUID          complaintId;
    private Integer       newWardId;
    private String        newWardName;
    private LocalDateTime updatedAt;
}