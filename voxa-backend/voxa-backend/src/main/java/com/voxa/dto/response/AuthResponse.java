package com.voxa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String  accessToken;
    private String  refreshToken;
    private UUID    userId;
    private String  name;
    private String  role;
    private Integer wardId;
    private String  wardName;
    private String  department;
}