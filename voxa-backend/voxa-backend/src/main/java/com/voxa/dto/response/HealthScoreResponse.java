package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HealthScoreResponse {
    private Integer       score;
    private String        label;
    private String        trend;
    private Components    components;
    private LocalDateTime calculatedAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Components {
        private Double  resolutionRate;
        private Double  avgResponseHours;
        private Long    criticalBacklog;
        private Double  wardCoverage;
    }
}