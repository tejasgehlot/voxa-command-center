package com.voxa.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UpvoteResponse {
    private Integer    upvotes;
    private BigDecimal priorityScore;
}