package com.voxa.controller;

import com.voxa.dto.request.*;
import com.voxa.dto.response.*;
import com.voxa.service.DeptHeadService;
import com.voxa.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dept")
@RequiredArgsConstructor
public class DeptHeadController {

    private final DeptHeadService deptHeadService;

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<DeptComplaintPageResponse>> getComplaints(
            @RequestParam(defaultValue = "0")        int     page,
            @RequestParam(defaultValue = "30")       int     size,
            @RequestParam(required = false)          String  status,
            @RequestParam(required = false)          Integer wardId,
            @RequestParam(defaultValue = "PRIORITY") String  sort) {

        return ResponseEntity.ok(ApiResponse.success(
                "Department complaints fetched",
                deptHeadService.getDeptComplaints(page, size, status, wardId, sort)
        ));
    }

    @PatchMapping("/complaints/{id}/reassign")
    public ResponseEntity<ApiResponse<ReassignResponse>> reassign(
            @PathVariable UUID id,
            @Valid @RequestBody ReassignRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                "Complaint reassigned", deptHeadService.reassign(id, request)
        ));
    }

    @PostMapping("/complaints/{id}/escalate")
    public ResponseEntity<ApiResponse<EscalateResponse>> escalate(
            @PathVariable UUID id,
            @Valid @RequestBody EscalateRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                "Complaint escalated to Admin", deptHeadService.escalate(id, request)
        ));
    }

    @PostMapping("/complaints/{id}/internal-notes")
    public ResponseEntity<ApiResponse<TimelineResponse>> addInternalNote(
            @PathVariable UUID id,
            @Valid @RequestBody InternalNoteRequest request) {

        return ResponseEntity.ok(ApiResponse.success(
                "Internal note added", deptHeadService.addInternalNote(id, request)
        ));
    }
}