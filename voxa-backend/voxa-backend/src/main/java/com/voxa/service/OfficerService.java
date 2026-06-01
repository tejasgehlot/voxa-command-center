package com.voxa.service;

import com.voxa.dto.request.*;
import com.voxa.dto.response.*;
import com.voxa.entity.*;
import com.voxa.exception.BadRequestException;
import com.voxa.exception.ResourceNotFoundException;
import com.voxa.repository.*;
import com.voxa.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfficerService {

    private final ComplaintRepository         complaintRepository;
    private final ComplaintTimelineRepository timelineRepository;
    private final ActivityLogRepository       activityLogRepository;
    private final UserRepository              userRepository;
    private final SecurityUtil                securityUtil;

    // ── GET /officer/complaints ──────────────────────────────────
    public OfficerComplaintPageResponse getWardComplaints(
            int page, int size, String status, String category, String sort) {

        Integer wardId = securityUtil.getCurrentUserWardId();
        if (wardId == null) {
            throw new BadRequestException("Officer is not assigned to any ward");
        }

        Sort   sortOrder = resolveSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<Complaint> complaints = (status != null && !status.isBlank())
                ? complaintRepository.findByWardIdAndStatus(
                wardId, parseStatus(status), pageable)
                : complaintRepository.findByWardId(wardId, pageable);

        WardStatsResponse stats = buildWardStats(wardId);

        List<OfficerComplaintResponse> content = complaints.stream()
                .map(this::toOfficerResponse)
                .collect(Collectors.toList());

        return OfficerComplaintPageResponse.builder()
                .content(content)
                .wardStats(stats)
                .totalElements(complaints.getTotalElements())
                .totalPages(complaints.getTotalPages())
                .currentPage(page)
                .build();
    }

    // ── PATCH /officer/complaints/{id}/status ────────────────────
    @Transactional
    public ComplaintDetailResponse updateStatus(
            UUID id, UpdateStatusRequest request) {

        Complaint complaint = findAndVerifyWard(id);

        Complaint.Status newStatus = parseStatus(request.getStatus());
        if (newStatus == Complaint.Status.OPEN) {
            throw new BadRequestException(
                    "Cannot revert status back to OPEN"
            );
        }

        complaint.setStatus(newStatus);
        complaintRepository.save(complaint);

        // Timeline entry
        ComplaintTimeline timeline = new ComplaintTimeline();
        timeline.setComplaint(complaint);
        timeline.setStage(
                newStatus == Complaint.Status.IN_PROGRESS
                        ? ComplaintTimeline.Stage.IN_PROGRESS
                        : ComplaintTimeline.Stage.RESOLVED
        );
        timeline.setNote(request.getNote());
        timeline.setActorId(securityUtil.getCurrentUserId());
        timeline.setActorName(securityUtil.getCurrentUser().getUsername());
        timelineRepository.save(timeline);

        // Activity log
        logActivity(complaint.getId(), ActivityLog.Action.STATUS_UPDATE,
                "Status changed to " + newStatus
                        + " by " + securityUtil.getCurrentUser().getUsername());

        log.info("Complaint {} updated to {}", id, newStatus);
        return toDetail(complaint);
    }

    // ── POST /officer/complaints/{id}/notes ──────────────────────
    @Transactional
    public TimelineResponse addNote(UUID id, AddNoteRequest request) {
        Complaint complaint = findAndVerifyWard(id);

        ComplaintTimeline timeline = new ComplaintTimeline();
        timeline.setComplaint(complaint);
        timeline.setStage(ComplaintTimeline.Stage.IN_PROGRESS);
        timeline.setNote(request.getNote());
        timeline.setActorId(securityUtil.getCurrentUserId());
        timeline.setActorName(securityUtil.getCurrentUser().getUsername());
        timeline = timelineRepository.save(timeline);

        logActivity(complaint.getId(), ActivityLog.Action.NOTE_ADDED,
                "Note added by " + securityUtil.getCurrentUser().getUsername()
                        + ": " + request.getNote());

        return TimelineResponse.builder()
                .stage(timeline.getStage().name())
                .note(timeline.getNote())
                .actor(timeline.getActorName())
                .at(timeline.getCreatedAt())
                .build();
    }

    // ── Private helpers ──────────────────────────────────────────

    private Complaint findAndVerifyWard(UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Complaint not found: " + complaintId
                ));

        Integer officerWardId = securityUtil.getCurrentUserWardId();
        if (!complaint.getWard().getId().equals(officerWardId)) {
            throw new BadRequestException(
                    "This complaint belongs to a different ward"
            );
        }
        return complaint;
    }

    private WardStatsResponse buildWardStats(Integer wardId) {
        List<Complaint> all = complaintRepository
                .findByWardId(wardId, Pageable.unpaged()).getContent();

        long total       = all.size();
        long critical    = all.stream()
                .filter(c -> c.getAiSeverity() >= 8
                        && c.getStatus() != Complaint.Status.RESOLVED)
                .count();
        long inProgress  = all.stream()
                .filter(c -> c.getStatus() == Complaint.Status.IN_PROGRESS)
                .count();
        long resolvedToday = all.stream()
                .filter(c -> c.getStatus() == Complaint.Status.RESOLVED
                        && c.getUpdatedAt() != null
                        && c.getUpdatedAt().isAfter(
                        LocalDateTime.now()
                                .withHour(0).withMinute(0).withSecond(0)))
                .count();

        return WardStatsResponse.builder()
                .total(total).critical(critical)
                .inProgress(inProgress).resolvedToday(resolvedToday)
                .build();
    }

    private void logActivity(UUID complaintId,
                             ActivityLog.Action action, String detail) {
        ActivityLog log = new ActivityLog();
        log.setUserId(securityUtil.getCurrentUserId());
        log.setUserName(securityUtil.getCurrentUser().getUsername());
        log.setRole(User.Role.valueOf(securityUtil.getCurrentUserRole()));
        log.setAction(action);
        log.setComplaintId(complaintId);
        log.setDetail(detail);
        activityLogRepository.save(log);
    }

    private Sort resolveSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "priorityScore");
        return switch (sort.toUpperCase()) {
            case "DATE"     -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "SEVERITY" -> Sort.by(Sort.Direction.DESC, "aiSeverity");
            case "UPVOTES"  -> Sort.by(Sort.Direction.DESC, "upvotes");
            default         -> Sort.by(Sort.Direction.DESC, "priorityScore");
        };
    }

    private Complaint.Status parseStatus(String status) {
        try {
            return Complaint.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Invalid status. Use: OPEN, IN_PROGRESS, or RESOLVED"
            );
        }
    }

    private String resolveSeverityLabel(int severity) {
        if (severity >= 9) return "CRITICAL";
        if (severity >= 7) return "HIGH";
        if (severity >= 4) return "MEDIUM";
        return "LOW";
    }

    private OfficerComplaintResponse toOfficerResponse(Complaint c) {
        return OfficerComplaintResponse.builder()
                .complaintId(c.getId())
                .trackingId(c.getTrackingId())
                .citizenName(c.getCitizenName())
                .citizenPhone("****hidden")
                .aiCategory(c.getAiCategory().name())
                .aiSeverity(c.getAiSeverity())
                .severityLabel(resolveSeverityLabel(c.getAiSeverity()))
                .priorityScore(c.getPriorityScore())
                .status(c.getStatus().name())
                .upvotes(c.getUpvotes())
                .description(c.getDescription())
                .photoUrl(c.getPhotoUrl())
                .latitude(c.getLatitude().doubleValue())
                .longitude(c.getLongitude().doubleValue())
                .escalated(c.getEscalated())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
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

        return ComplaintDetailResponse.builder()
                .complaintId(c.getId())
                .trackingId(c.getTrackingId())
                .aiCategory(c.getAiCategory().name())
                .aiSeverity(c.getAiSeverity())
                .severityLabel(resolveSeverityLabel(c.getAiSeverity()))
                .aiDepartment(c.getAiDepartment())
                .aiDepartmentGu(c.getAiDepartmentGu())
                .description(c.getDescription())
                .status(c.getStatus().name())
                .wardName(c.getWard().getWardName())
                .photoUrl(c.getPhotoUrl())
                .upvotes(c.getUpvotes())
                .escalated(c.getEscalated())
                .timeline(timeline)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}