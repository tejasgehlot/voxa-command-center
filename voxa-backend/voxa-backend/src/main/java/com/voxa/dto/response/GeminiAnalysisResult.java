package com.voxa.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiAnalysisResult {

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