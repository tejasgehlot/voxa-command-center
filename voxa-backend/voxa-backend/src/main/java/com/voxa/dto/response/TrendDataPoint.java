package com.voxa.dto.response;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TrendDataPoint {
    private String  date;
    private Integer submitted;
    private Integer resolved;
    private Integer critical;
}