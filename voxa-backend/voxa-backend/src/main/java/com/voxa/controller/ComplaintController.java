package com.voxa.controller;

import com.voxa.dto.request.*;
import com.voxa.dto.response.*;
import com.voxa.service.ComplaintService;
import com.voxa.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    // POST /complaints
    @PostMapping(value = "/complaints",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ComplaintSubmitResponse>> submit(
            @RequestPart("photo")        MultipartFile photo,
            @RequestPart("name")         String name,
            @RequestPart("phone")        String phone,
            @RequestPart("description")  String description,
            @RequestPart("latitude")     String latitude,
            @RequestPart("longitude")    String longitude) {

        ComplaintRequest request = new ComplaintRequest();
        request.setName(name);
        request.setPhone(phone);
        request.setDescription(description);
        request.setLatitude(new BigDecimal(latitude));
        request.setLongitude(new BigDecimal(longitude));

        ComplaintSubmitResponse response =
                complaintService.submitComplaint(request, photo);

        return ResponseEntity.ok(
                ApiResponse.success("Complaint submitted successfully", response)
        );
    }

    // GET /complaints
    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintSummaryResponse>>> getAll(
            @RequestParam(defaultValue = "0")  int     page,
            @RequestParam(defaultValue = "20") int     size,
            @RequestParam(required = false)    String  category,
            @RequestParam(required = false)    String  severity,
            @RequestParam(required = false)    String  status,
            @RequestParam(required = false)    Integer wardId) {

        return ResponseEntity.ok(ApiResponse.success("Complaints fetched",
                complaintService.getAllComplaints(
                        page, size, category, severity, status, wardId)));
    }

    // GET /map/pins
    @GetMapping("/map/pins")
    public ResponseEntity<ApiResponse<List<MapPinResponse>>> getMapPins(
            @RequestParam(required = false) String  category,
            @RequestParam(required = false) String  severity,
            @RequestParam(required = false) String  status,
            @RequestParam(required = false) Integer wardId) {

        return ResponseEntity.ok(ApiResponse.success("Map pins fetched",
                complaintService.getMapPins(category, severity, status, wardId)));
    }

    // GET /complaints/track
    @GetMapping("/complaints/track")
    public ResponseEntity<ApiResponse<List<ComplaintDetailResponse>>> track(
            @RequestParam               String phone,
            @RequestParam(required = false) String trackingId) {

        return ResponseEntity.ok(ApiResponse.success("Complaints tracked",
                complaintService.trackComplaint(phone, trackingId)));
    }

    // GET /complaints/{id}
    @GetMapping("/complaints/{id}")
    public ResponseEntity<ApiResponse<ComplaintDetailResponse>> getById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(ApiResponse.success("Complaint fetched",
                complaintService.getComplaintById(id)));
    }

    // POST /complaints/{id}/upvote
    @PostMapping("/complaints/{id}/upvote")
    public ResponseEntity<ApiResponse<UpvoteResponse>> upvote(
            @PathVariable UUID id,
            @Valid @RequestBody UpvoteRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Upvote recorded",
                complaintService.upvoteComplaint(id, request)));
    }

    // POST /complaints/{id}/comments
    @PostMapping("/complaints/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Comment added",
                complaintService.addComment(id, request)));
    }

    // GET /complaints/{id}/comments
    @GetMapping("/complaints/{id}/comments")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getComments(
            @PathVariable              UUID id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success("Comments fetched",
                complaintService.getComments(id, page, size)));
    }
}