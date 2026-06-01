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
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeptHeadService {

    private final ComplaintRepository         complaintRepository;
    private final ComplaintTimelineRepository timelineRepository;
    private final ActivityLogRepository       activityLogRepository;
    private final NotificationRepository      notificationRepository;
    private final UserRepository              userRepository;
    private final WardRepository              wardRepository;
    private final SecurityUtil                securityUtil;

    // ── GET /dept/complaints ─────────────────────────────────────
    public DeptComplaintPageResponse getDeptComplaints(
            int page, int size, String status,
            Integer wardId, String sort) {

        String department = securityUtil.getCurrentUserDepartment();
        if (department == null || department.isBlank()) {
            throw new BadRequestException(
                    "Dept Head is not assigned to any department"
            );
        }

        Sort     sortOrder = resolveSort(sort);
        Pageable pageable  = PageRequest.of(page, size, sortOrder);

        Page<Complaint> complaints;
        if (wardId != null && status != null && !status.isBlank()) {
            complaints = complaintRepository
                    .findByWardIdAndStatus(wardId, parseStatus(status), pageable);
        } else if (wardId != null) {
            complaints = complaintRepository.findByWardId(wardId, pageable);
        } else {
            complaints = complaintRepository.findByAiDepartment(department, pageable);
        }

        DeptStatsResponse stats = buildDeptStats(department);

        List<OfficerComplaintResponse> content = complaints.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return DeptComplaintPageResponse.builder()
                .content(content)
                .deptStats(stats)
                .totalElements(complaints.getTotalElements())
                .totalPages(complaints.getTotalPages())
                .currentPage(page)
                .build();
    }

    // ── PATCH /dept/complaints/{id}/reassign ─────────────────────
    @Transactional
    public ReassignResponse reassign(UUID id, ReassignRequest request) {
        Complaint complaint = findComplaint(id);

        Ward newWard = wardRepository.findById(request.getTargetWardId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ward not found: " + request.getTargetWardId()
                ));

        complaint.setWard(newWard);
        complaintRepository.save(complaint);

        // Timeline
        ComplaintTimeline timeline = new ComplaintTimeline();
        timeline.setComplaint(complaint);
        timeline.setStage(ComplaintTimeline.Stage.ASSIGNED);
        timeline.setInternalNote("Reassigned to " + newWard.getWardName()
                + (request.getReason() != null
                ? " — Reason: " + request.getReason() : ""));
        timeline.setActorId(securityUtil.getCurrentUserId());
        timeline.setActorName(securityUtil.getCurrentUser().getUsername());
        timelineRepository.save(timeline);

        // Notify ward officers of new ward
        notifyWardOfficers(newWard.getId(), complaint);

        logActivity(id, ActivityLog.Action.REASSIGNED,
                "Reassigned to " + newWard.getWardName()
                        + " by " + securityUtil.getCurrentUser().getUsername());

        return ReassignResponse.builder()
                .complaintId(complaint.getId())
                .newWardId(newWard.getId())
                .newWardName(newWard.getWardName())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    // ── POST /dept/complaints/{id}/escalate ──────────────────────
    @Transactional
    public EscalateResponse escalate(UUID id, EscalateRequest request) {
        Complaint complaint = findComplaint(id);

        if (complaint.getEscalated()) {
            throw new BadRequestException("Complaint is already escalated");
        }

        complaint.setEscalated(true);
        complaintRepository.save(complaint);

        // Timeline
        ComplaintTimeline timeline = new ComplaintTimeline();
        timeline.setComplaint(complaint);
        timeline.setStage(ComplaintTimeline.Stage.IN_PROGRESS);
        timeline.setInternalNote("ESCALATED: " + request.getReason());
        timeline.setActorId(securityUtil.getCurrentUserId());
        timeline.setActorName(securityUtil.getCurrentUser().getUsername());
        timelineRepository.save(timeline);

        // Notify all admins
        notifyAdmins(complaint, request.getReason());

        logActivity(id, ActivityLog.Action.ESCALATED,
                "Escalated by " + securityUtil.getCurrentUser().getUsername()
                        + " — " + request.getReason());

        return EscalateResponse.builder()
                .complaintId(complaint.getId())
                .escalated(true)
                .escalatedAt(LocalDateTime.now())
                .build();
    }

    // ── POST /dept/complaints/{id}/internal-notes ─────────────────
    @Transactional
    public TimelineResponse addInternalNote(UUID id,
                                            InternalNoteRequest request) {
        Complaint complaint = findComplaint(id);

        ComplaintTimeline timeline = new ComplaintTimeline();
        timeline.setComplaint(complaint);
        timeline.setStage(ComplaintTimeline.Stage.IN_PROGRESS);
        timeline.setInternalNote(request.getNote());
        timeline.setActorId(securityUtil.getCurrentUserId());
        timeline.setActorName(securityUtil.getCurrentUser().getUsername());
        timeline = timelineRepository.save(timeline);

        logActivity(id, ActivityLog.Action.NOTE_ADDED,
                "Internal note by " + securityUtil.getCurrentUser().getUsername());

        return TimelineResponse.builder()
                .stage(timeline.getStage().name())
                .note("[Internal] " + timeline.getInternalNote())
                .actor(timeline.getActorName())
                .at(timeline.getCreatedAt())
                .build();
    }

    // ── Private helpers ──────────────────────────────────────────

    private Complaint findComplaint(UUID id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Complaint not found: " + id
                ));
    }

    private DeptStatsResponse buildDeptStats(String department) {
        List<Complaint> all = complaintRepository
                .findByAiDepartment(department, Pageable.unpaged())
                .getContent();

        long total     = all.size();
        long critical  = all.stream()
                .filter(c -> c.getAiSeverity() >= 8
                        && c.getStatus() != Complaint.Status.RESOLVED)
                .count();
        long escalated = all.stream()
                .filter(Complaint::getEscalated).count();
        double avg     = all.stream()
                .filter(c -> c.getStatus() == Complaint.Status.RESOLVED
                        && c.getUpdatedAt() != null)
                .mapToLong(c -> ChronoUnit.DAYS.between(
                        c.getCreatedAt(), c.getUpdatedAt()))
                .average().orElse(0.0);

        return DeptStatsResponse.builder()
                .total(total).critical(critical)
                .escalated(escalated)
                .avgResolutionDays(Math.round(avg * 10.0) / 10.0)
                .build();
    }

    private void notifyWardOfficers(Integer wardId, Complaint complaint) {
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.WARD_OFFICER
                        && u.getWard() != null
                        && u.getWard().getId().equals(wardId))
                .forEach(officer -> {
                    Notification n = new Notification();
                    n.setUser(officer);
                    n.setType(Notification.Type.NEW_COMPLAINT);
                    n.setTitle("Complaint reassigned to your ward");
                    n.setBody("Complaint " + complaint.getTrackingId()
                            + " has been reassigned to your ward.");
                    n.setComplaintId(complaint.getId());
                    notificationRepository.save(n);
                });
    }

    private void notifyAdmins(Complaint complaint, String reason) {
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .forEach(admin -> {
                    Notification n = new Notification();
                    n.setUser(admin);
                    n.setType(Notification.Type.ESCALATION);
                    n.setTitle("Complaint escalated — " + complaint.getTrackingId());
                    n.setBody("Escalated by "
                            + securityUtil.getCurrentUser().getUsername()
                            + ": " + reason);
                    n.setComplaintId(complaint.getId());
                    notificationRepository.save(n);
                });
    }

    private void logActivity(UUID complaintId,
                             ActivityLog.Action action, String detail) {
        ActivityLog log = new ActivityLog();
        log.setUserId(securityUtil.getCurrentUserId());
        log.setUserName(securityUtil.getCurrentUser().getUsername());
        log.setRole(User.Role.DEPT_HEAD);
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
            throw new BadRequestException("Invalid status: " + status);
        }
    }

    private String resolveSeverityLabel(int severity) {
        if (severity >= 9) return "CRITICAL";
        if (severity >= 7) return "HIGH";
        if (severity >= 4) return "MEDIUM";
        return "LOW";
    }

    private OfficerComplaintResponse toResponse(Complaint c) {
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
}