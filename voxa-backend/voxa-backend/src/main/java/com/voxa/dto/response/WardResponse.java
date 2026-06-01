package com.voxa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WardResponse {

    private Integer id;
    private String  wardName;
    private String  wardNameGu;
    private String  zone;
}