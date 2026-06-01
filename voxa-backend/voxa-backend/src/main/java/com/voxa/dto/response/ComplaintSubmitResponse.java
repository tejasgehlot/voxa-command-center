package com.voxa.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ComplaintSubmitResponse {
    private UUID          complaintId;
    private String        trackingId;
    private String        aiCategory;
    private Integer       aiSeverity;
    private String        aiSeverityLabel;
    private String        aiDepartment;
    private String        aiDepartmentGu;
    private String        aiLetterEn;
    private String        aiLetterGu;
    private String        aiSummary;
    private Double        aiConfidence;
    private Integer       wardId;
    private String        wardName;
    private String        photoUrl;
    private BigDecimal    priorityScore;
    private String        status;
    private LocalDateTime createdAt;
    private String        smsStatus;
}