package com.voxa.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReassignRequest {

    @NotNull(message = "Target ward ID is required")
    @Min(value = 1,  message = "Ward ID must be between 1 and 19")
    @Max(value = 19, message = "Ward ID must be between 1 and 19")
    private Integer targetWardId;

    private String reason;
}