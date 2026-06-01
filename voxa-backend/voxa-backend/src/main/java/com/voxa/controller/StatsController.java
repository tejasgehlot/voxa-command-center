package com.voxa.controller;

import com.voxa.dto.response.PublicStatsResponse;
import com.voxa.service.StatsService;
import com.voxa.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/stats/public")
    public ResponseEntity<ApiResponse<PublicStatsResponse>> getPublicStats() {
        return ResponseEntity.ok(
                ApiResponse.success("Stats fetched", statsService.getPublicStats())
        );
    }
}