package com.voxa.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WardStatsResponse {
    private Long total;
    private Long critical;
    private Long inProgress;
    private Long resolvedToday;
}