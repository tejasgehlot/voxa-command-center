package com.voxa.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalyseResponse {

    private String  category;
    private Integer severity;
    private String  severityLabel;
    private String  department;
    private String  departmentGu;
    private String  summary;
    private String  urgency;
    private String  letterEn;
    private String  letterGu;
    private Double  confidence;
}