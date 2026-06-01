package com.voxa.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Size(max = 100)
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private Integer wardId;
    private String  department;
}