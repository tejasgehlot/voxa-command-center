package com.voxa.service;

import com.voxa.dto.request.*;
import com.voxa.dto.response.*;
import com.voxa.entity.*;
import com.voxa.exception.BadRequestException;
import com.voxa.exception.ResourceNotFoundException;
import com.voxa.repository.*;
import com.voxa.util.HashUtil;
import com.voxa.util.TrackingIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository         complaintRepository;
    private final ComplaintTimelineRepository timelineRepository;
    private final UpvoteRepository            upvoteRepository;
    private final CommentRepository           commentRepository;
    private final WardRepository              wardRepository;
    private final CloudinaryService           cloudinaryService;
    private final GeminiService               geminiService;
    private final NominatimService            nominatimService;
    private final TrackingIdGenerator         trackingIdGenerator;
    private final HashUtil                    hashUtil;

    // ── POST /complaints ─────────────────────────────────────────
    @Transactional
    public ComplaintSubmitResponse submitComplaint(
            ComplaintRequest request,
            MultipartFile    photo) {

        // 1. Upload photo to Cloudinary
        log.info("Uploading photo to Cloudinary...");
        String photoUrl = cloudinaryService.uploadComplaintPhoto(photo);

        // 2. Run Gemini AI analysis
        log.info("Running Gemini AI analysis...");
        GeminiAnalysisResult ai = geminiService.analysePhoto(
                photo, request.getDescription()
        );

        // 3. Auto-detect ward from GPS
        Ward ward = nominatimService.detectWard(
                request.getLatitude(), request.getLongitude()
        );

        // 4. Build and save complaint
        Complaint complaint = new Complaint();
        complaint.setTrackingId(trackingIdGenerator.generate());
        complaint.setCitizenName(request.getName());
        complaint.setCitizenPhone(hashUtil.hashPhone(request.getPhone()));
        complaint.setDescription(request.getDescription());
        complaint.setPhotoUrl(photoUrl);
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());
        complaint.setWard(ward);
        complaint.setAiCategory(
                Complaint.Category.valueOf(ai.getCategory())
        );
        complaint.setAiSeverity(ai.getSeverity());
        complaint.setAiDepartment(ai.getDepartment());
        complaint.setAiDepartmentGu(ai.getDepartmentGu());
        complaint.setAiLetterEn(ai.getLetterEn());
        complaint.setAiLetterGu(ai.getLetterGu());
        complaint.setAiSummary(ai.getSummary());
        complaint.setAiConfidence(
                ai.getConfidence() != null
                        ? BigDecimal.valueOf(ai.getConfidence()) : null
        );
        complaint.setPriorityScore(
                BigDecimal.valueOf(ai.getSeverity() * 2L)
        );
        complaint.setStatus(Complaint.Status.OPEN);

        complaint = complaintRepository.save(complaint);
        log.info("Complaint saved: {}", complaint.getTrackingId());

        // 5. Add timeline entries
        addTimeline(complaint, ComplaintTimeline.Stage.SUBMITTED,
                "Complaint submitted by citizen", null, null);
        addTimeline(complaint, ComplaintTimeline.Stage.AI_ANALYSED,
                "AI analysis completed — Category: " + ai.getCategory()
                        + ", Severity: " + ai.getSeverity(), null, null);

        return ComplaintSubmitResponse.builder()
                .complaintId(complaint.getId())
                .trackingId(complaint.getTrackingId())
                .aiCategory(ai.getCategory())
                .aiSeverity(ai.getSeverity())
                .aiSeverityLabel(ai.getSeverityLabel())
                .aiDepartment(ai.getDepartment())
                .aiDepartmentGu(ai.getDepartmentGu())
                .aiLetterEn(ai.getLetterEn())
                .aiLetterGu(ai.getLetterGu())
                .aiSummary(ai.getSummary())
                .aiConfidence(ai.getConfidence())
                .wardId(ward.getId())
                .wardName(ward.getWardName())
                .photoUrl(photoUrl)
                .priorityScore(complaint.getPriorityScore())
                .status(complaint.getStatus().name())
                .createdAt(complaint.getCreatedAt())
                .smsStatus("PENDING")
                .build();
    }

    // ── GET /complaints ──────────────────────────────────────────
    public Page<ComplaintSummaryResponse> getAllComplaints(
            int page, int size,
            String category, String severity,
            String status,   Integer wardId) {

        Pageable pageable = PageRequest.of(
                page, size,
                Sort.by(Sort.Direction.DESC, "priorityScore")
        );

        Page<Complaint> complaints = wardId != null
                ? complaintRepository.findByWardId(wardId, pageable)
                : complaintRepository.findAll(pageable);

        return complaints.map(this::toSummary);
    }

    // ── GET /map/pins ────────────────────────────────────────────
    public List<MapPinResponse> getMapPins(
            String category, String severity,
            String status,   Integer wardId) {

        return complaintRepository.findAll()
                .stream()
                .map(c -> MapPinResponse.builder()
                        .complaintId(c.getId())
                        .latitude(c.getLatitude().doubleValue())
                        .longitude(c.getLongitude().doubleValue())
                        .severity(c.getAiSeverity())
                        .category(c.getAiCategory().name())
                        .status(c.getStatus().name())
                        .upvotes(c.getUpvotes())
                        .escalated(c.getEscalated())
                        .build())
                .collect(Collectors.toList());
    }

    // ── GET /complaints/{id} ─────────────────────────────────────
    public ComplaintDetailResponse getComplaintById(UUID id) {
        return toDetail(findComplaintById(id));
    }

    // ── GET /complaints/track ────────────────────────────────────
    public List<ComplaintDetailResponse> trackComplaint(
            String phone, String trackingId) {

        String hashedPhone = hashUtil.hashPhone(phone);

        if (trackingId != null && !trackingId.isBlank()) {
            Complaint c = complaintRepository
                    .findByCitizenPhoneAndTrackingId(hashedPhone, trackingId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "No complaint found for this phone and tracking ID"
                    ));
            return List.of(toDetail(c));
        }

        Page<Complaint> complaints = complaintRepository
                .findByCitizenPhone(hashedPhone,
                        PageRequest.of(0, 50,
                                Sort.by(Sort.Direction.DESC, "createdAt")));

        if (complaints.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No complaints found for this phone number"
            );
        }

        return complaints.stream()
                .map(this::toDetail)
                .collect(Collectors.toList());
    }

    // ── POST /complaints/{id}/upvote ─────────────────────────────
    @Transactional
    public UpvoteResponse upvoteComplaint(UUID id, UpvoteRequest request) {
        Complaint complaint  = findComplaintById(id);
        String    hashedPhone = hashUtil.hashPhone(request.getPhone());

        if (upvoteRepository.existsByComplaintIdAndCitizenPhone(id, hashedPhone)) {
            throw new BadRequestException("You have already upvoted this complaint");
        }

        try {
            Upvote upvote = new Upvote();
            upvote.setComplaint(complaint);
            upvote.setCitizenPhone(hashedPhone);
            upvoteRepository.save(upvote);

            complaint.setUpvotes(complaint.getUpvotes() + 1);
            complaint.setPriorityScore(BigDecimal.valueOf(
                    (complaint.getAiSeverity() * 2L) + complaint.getUpvotes()
            ));
            complaintRepository.save(complaint);

            return UpvoteResponse.builder()
                    .upvotes(complaint.getUpvotes())
                    .priorityScore(complaint.getPriorityScore())
                    .build();

        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("You have already upvoted this complaint");
        }
    }

    // ── POST /complaints/{id}/comments ───────────────────────────
    @Transactional
    public CommentResponse addComment(UUID id, CommentRequest request) {
        Complaint complaint   = findComplaintById(id);
        String    hashedPhone = hashUtil.hashPhone(request.getPhone());

        long count = commentRepository
                .countByComplaintIdAndCommenterPhone(id, hashedPhone);
        if (count >= 3) {
            throw new BadRequestException(
                    "You have reached the maximum of 3 comments on this complaint"
            );
        }

        Comment comment = new Comment();
        comment.setComplaint(complaint);
        comment.setCommenterName(request.getName());
        comment.setCommenterPhone(hashedPhone);
        comment.setComment(request.getComment());
        comment = commentRepository.save(comment);

        return CommentResponse.builder()
                .commentId(comment.getId())
                .name(comment.getCommenterName())
                .comment(comment.getComment())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    // ── GET /complaints/{id}/comments ────────────────────────────
    public Page<CommentResponse> getComments(UUID id, int page, int size) {
        findComplaintById(id);
        Pageable pageable = PageRequest.of(page, size);
        return commentRepository
                .findByComplaintIdOrderByCreatedAtDesc(id, pageable)
                .map(c -> CommentResponse.builder()
                        .commentId(c.getId())
                        .name(c.getCommenterName())
                        .comment(c.getComment())
                        .createdAt(c.getCreatedAt())
                        .build());
    }

    // ── Private helpers ──────────────────────────────────────────

    private Complaint findComplaintById(UUID id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Complaint not found: " + id
                ));
    }

    private void addTimeline(Complaint complaint,
                             ComplaintTimeline.Stage stage,
                             String note,
                             UUID actorId,
                             String actorName) {
        ComplaintTimeline timeline = new ComplaintTimeline();
        timeline.setComplaint(complaint);
        timeline.setStage(stage);
        timeline.setNote(note);
        timeline.setActorId(actorId);
        timeline.setActorName(actorName);
        timelineRepository.save(timeline);
    }

    private String resolveSeverityLabel(int severity) {
        if (severity >= 9) return "CRITICAL";
        if (severity >= 7) return "HIGH";
        if (severity >= 4) return "MEDIUM";
        return "LOW";
    }

    private ComplaintSummaryResponse toSummary(Complaint c) {
        long commentCount = commentRepository
                .findByComplaintIdOrderByCreatedAtDesc(
                        c.getId(), PageRequest.of(0, 1))
                .getTotalElements();

        return ComplaintSummaryResponse.builder()
                .complaintId(c.getId())
                .trackingId(c.getTrackingId())
                .aiCategory(c.getAiCategory().name())
                .aiSeverity(c.getAiSeverity())
                .severityLabel(resolveSeverityLabel(c.getAiSeverity()))
                .status(c.getStatus().name())
                .wardName(c.getWard().getWardName())
                .photoUrl(c.getPhotoUrl())
                .upvotes(c.getUpvotes())
                .commentCount((int) commentCount)
                .latitude(c.getLatitude().doubleValue())
                .longitude(c.getLongitude().doubleValue())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private ComplaintDetailResponse toDetail(Complaint c) {
        List<TimelineResponse> timeline = timelineRepository
                .findByComplaintIdOrderByCreatedAtAsc(c.getId())
                .stream()
                .map(t -> TimelineResponse.builder()
                        .stage(t.getStage().name())
                        .note(t.getNote())
                        .actor(t.getActorName())
                        .at(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        List<CommentResponse> comments = commentRepository
                .findByComplaintIdOrderByCreatedAtDesc(
                        c.getId(), PageRequest.of(0, 10))
                .stream()
                .map(cm -> CommentResponse.builder()
                        .commentId(cm.getId())
                        .name(cm.getCommenterName())
                        .comment(cm.getComment())
                        .createdAt(cm.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        long commentCount = commentRepository
                .findByComplaintIdOrderByCreatedAtDesc(
                        c.getId(), PageRequest.of(0, 1))
                .getTotalElements();

        return ComplaintDetailResponse.builder()
                .complaintId(c.getId())
                .trackingId(c.getTrackingId())
                .aiCategory(c.getAiCategory().name())
                .aiSeverity(c.getAiSeverity())
                .severityLabel(resolveSeverityLabel(c.getAiSeverity()))
                .aiDepartment(c.getAiDepartment())
                .aiDepartmentGu(c.getAiDepartmentGu())
                .aiLetterEn(c.getAiLetterEn())
                .aiLetterGu(c.getAiLetterGu())
                .aiSummary(c.getAiSummary())
                .description(c.getDescription())
                .status(c.getStatus().name())
                .wardName(c.getWard().getWardName())
                .photoUrl(c.getPhotoUrl())
                .upvotes(c.getUpvotes())
                .commentCount((int) commentCount)
                .escalated(c.getEscalated())
                .timeline(timeline)
                .comments(comments)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}