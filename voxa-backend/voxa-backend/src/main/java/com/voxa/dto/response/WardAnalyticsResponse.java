package com.voxa.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WardAnalyticsResponse {
    private Integer wardId;
    private String  wardName;
    private Long    total;
    private Long    open;
    private Long    resolved;
    private Double  avgResolutionDays;
}