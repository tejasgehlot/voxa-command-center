package com.voxa.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EscalateRequest {

    @NotBlank(message = "Reason for escalation is required")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}