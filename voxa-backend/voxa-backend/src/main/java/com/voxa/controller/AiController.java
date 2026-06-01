package com.voxa.controller;

import com.voxa.dto.response.AiAnalyseResponse;
import com.voxa.dto.response.GeminiAnalysisResult;
import com.voxa.service.GeminiService;
import com.voxa.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping(
            value    = "/analyse",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<AiAnalyseResponse>> analyse(
            @RequestPart("photo")                            MultipartFile photo,
            @RequestParam(value = "description",
                    required = false) String description) {

        GeminiAnalysisResult result =
                geminiService.analysePhoto(photo, description);

        AiAnalyseResponse response = AiAnalyseResponse.builder()
                .category(result.getCategory())
                .severity(result.getSeverity())
                .severityLabel(result.getSeverityLabel())
                .department(result.getDepartment())
                .departmentGu(result.getDepartmentGu())
                .summary(result.getSummary())
                .urgency(result.getUrgency())
                .letterEn(result.getLetterEn())
                .letterGu(result.getLetterGu())
                .confidence(result.getConfidence())
                .build();

        return ResponseEntity.ok(
                ApiResponse.success("AI analysis complete", response)
        );
    }
}