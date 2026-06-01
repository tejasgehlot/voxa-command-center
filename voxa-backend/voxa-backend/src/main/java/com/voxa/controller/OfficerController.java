package com.voxa.controller;

import com.voxa.dto.request.*;
import com.voxa.dto.response.*;
import com.voxa.service.OfficerService;
import com.voxa.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/officer")
@RequiredArgsConstructor
public class OfficerController {

    private final OfficerService officerService;

    // GET /officer/complaints
    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<OfficerComplaintPageResponse>> getComplaints(
            @RequestParam(defaultValue = "0")        int    page,
            @RequestParam(defaultValue = "30")       int    size,
            @RequestParam(required = false)          String status,
            @RequestParam(required = false)          String category,
            @RequestParam(defaultValue = "PRIORITY") String sort) {

        return ResponseEntity.ok(ApiResponse.success(
                "Ward complaints fetched",
                officerService.getWardComplaints(page, size, status, category, sort)
        ));
    }

    // PATCH /officer/complaints/{id}/status
    @PatchMapping("/complaints/{id}/status")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                "Status updated",
                officerService.updateStatus(id, request)
        ));
    }

    // POST /officer/complaints/{id}/notes
    @PostMapping("/complaints/{id}/notes")
    public ResponseEntity<ApiResponse<TimelineResponse>> addNote(
            @PathVariable UUID id,
            @Valid @RequestBody AddNoteRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                "Note added",
                officerService.addNote(id, request)
        ));
    }
}