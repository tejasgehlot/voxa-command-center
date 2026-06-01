package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CommentResponse {
    private UUID          commentId;
    private String        name;
    private String        comment;
    private LocalDateTime createdAt;
}