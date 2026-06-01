package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TimelineResponse {
    private String        stage;
    private String        note;
    private String        actor;
    private LocalDateTime at;
}