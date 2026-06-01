package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ComplaintSummaryResponse {
    private UUID          complaintId;
    private String        trackingId;
    private String        aiCategory;
    private Integer       aiSeverity;
    private String        severityLabel;
    private String        status;
    private String        wardName;
    private String        photoUrl;
    private Integer       upvotes;
    private Integer       commentCount;
    private Double        latitude;
    private Double        longitude;
    private LocalDateTime createdAt;
}