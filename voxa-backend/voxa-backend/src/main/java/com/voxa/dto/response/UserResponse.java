package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private UUID          userId;
    private String        name;
    private String        email;
    private String        role;
    private Integer       wardId;
    private String        wardName;
    private String        department;
    private Boolean       active;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}