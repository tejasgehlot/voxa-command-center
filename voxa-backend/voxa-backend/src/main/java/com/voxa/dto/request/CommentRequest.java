package com.voxa.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    private String phone;

    @NotBlank(message = "Comment is required")
    @Size(max = 300, message = "Comment must not exceed 300 characters")
    private String comment;
}