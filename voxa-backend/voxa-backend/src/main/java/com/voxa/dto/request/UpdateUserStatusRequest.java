package com.voxa.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;
}