package com.voxa.controller;

import com.voxa.dto.request.*;
import com.voxa.dto.response.*;
import com.voxa.service.AdminService;
import com.voxa.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin stats fetched", adminService.getStats()));
    }

    @GetMapping("/health-score")
    public ResponseEntity<ApiResponse<HealthScoreResponse>> getHealthScore() {
        return ResponseEntity.ok(ApiResponse.success(
                "Health score calculated", adminService.getHealthScore()));
    }

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<OfficerComplaintResponse>>> getAllComplaints(
            @RequestParam(defaultValue = "0")        int     page,
            @RequestParam(defaultValue = "50")       int     size,
            @RequestParam(required = false)          String  status,
            @RequestParam(required = false)          Integer wardId,
            @RequestParam(required = false)          String  department,
            @RequestParam(required = false)          String  severity,
            @RequestParam(required = false)          Boolean escalated,
            @RequestParam(defaultValue = "PRIORITY") String  sort) {

        return ResponseEntity.ok(ApiResponse.success("All complaints fetched",
                adminService.getAllComplaints(page, size, status, wardId,
                        department, severity, escalated, sort)));
    }

    @GetMapping("/analytics/trends")
    public ResponseEntity<ApiResponse<List<TrendDataPoint>>> getTrends(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(
                "Trends fetched", adminService.getTrends(days)));
    }

    @GetMapping("/analytics/by-ward")
    public ResponseEntity<ApiResponse<List<WardAnalyticsResponse>>> getByWard() {
        return ResponseEntity.ok(ApiResponse.success(
                "Ward analytics fetched", adminService.getByWard()));
    }

    @GetMapping("/analytics/by-department")
    public ResponseEntity<ApiResponse<List<DeptAnalyticsResponse>>> getByDept() {
        return ResponseEntity.ok(ApiResponse.success(
                "Department analytics fetched", adminService.getByDepartment()));
    }

    @GetMapping("/activity-log")
    public ResponseEntity<ApiResponse<Page<ActivityLogResponse>>> getActivityLog(
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "50") int    size,
            @RequestParam(required = false)    UUID   userId,
            @RequestParam(required = false)    String action) {

        return ResponseEntity.ok(ApiResponse.success("Activity log fetched",
                adminService.getActivityLog(page, size, userId, action)));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers(
            @RequestParam(required = false) String  role,
            @RequestParam(required = false) Integer wardId,
            @RequestParam(required = false) Boolean active) {

        return ResponseEntity.ok(ApiResponse.success(
                "Users fetched", adminService.getUsers(role, wardId, active)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.success(
                "User created", adminService.createUser(request)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "User updated", adminService.updateUser(id, request)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Status updated", adminService.updateUserStatus(id, request)));
    }
}