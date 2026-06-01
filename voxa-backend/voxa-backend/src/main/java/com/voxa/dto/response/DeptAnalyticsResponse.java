package com.voxa.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DeptAnalyticsResponse {
    private String department;
    private Long   total;
    private Long   open;
    private Long   resolved;
    private Double percentage;
}