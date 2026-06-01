package com.voxa.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PublicStatsResponse {
    private Long    totalResolved;
    private Long    totalComplaints;
    private Long    activeComplaints;
    private Long    resolvedThisMonth;
    private Double  avgResolutionDays;
    private Integer totalWards;
}