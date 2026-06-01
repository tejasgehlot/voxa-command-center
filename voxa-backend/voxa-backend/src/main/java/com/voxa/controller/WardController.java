package com.voxa.controller;

import com.voxa.dto.response.WardResponse;
import com.voxa.service.WardService;
import com.voxa.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class WardController {

    private final WardService wardService;

    @GetMapping("/wards")
    public ResponseEntity<ApiResponse<List<WardResponse>>> getAllWards() {
        List<WardResponse> wards = wardService.getAllWards();
        return ResponseEntity.ok(ApiResponse.success("Wards fetched successfully", wards));
    }
}