package com.voxa.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    @Size(max = 500, message = "Note must not exceed 500 characters")
    private String note;
}