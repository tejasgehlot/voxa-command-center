package com.voxa.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminStatsResponse {
    private Long   totalComplaints;
    private Long   resolvedToday;
    private Long   criticalActive;
    private Long   escalatedActive;
    private Double avgResolutionDays;
    private Long   totalCitizens;
    private String wardWithMostComplaints;
    private String deptWithMostBacklog;
}