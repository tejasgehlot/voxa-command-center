package com.voxa.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OfficerComplaintResponse {
    private UUID          complaintId;
    private String        trackingId;
    private String        citizenName;
    private String        citizenPhone;
    private String        aiCategory;
    private Integer       aiSeverity;
    private String        severityLabel;
    private BigDecimal    priorityScore;
    private String        status;
    private Integer       upvotes;
    private String        description;
    private String        photoUrl;
    private Double        latitude;
    private Double        longitude;
    private Boolean       escalated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}