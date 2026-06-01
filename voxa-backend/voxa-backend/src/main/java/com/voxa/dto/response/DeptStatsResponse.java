package com.voxa.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DeptStatsResponse {
    private Long   total;
    private Long   critical;
    private Long   escalated;
    private Double avgResolutionDays;
}