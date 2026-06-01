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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final ComplaintRepository         complaintRepository;
    private final ActivityLogRepository       activityLogRepository;
    private final UserRepository              userRepository;
    private final WardRepository              wardRepository;
    private final PasswordEncoder             passwordEncoder;
    private final SecurityUtil                securityUtil;

    // ── GET /admin/stats ─────────────────────────────────────────
    public AdminStatsResponse getStats() {
        long   total       = complaintRepository.count();
        long   resolved    = complaintRepository.countResolvedComplaints();
        long   critical    = complaintRepository.countCriticalActive();
        long   escalated   = complaintRepository.countEscalatedActive();
        long   citizens    = complaintRepository.countUniqueCitizens();
        Double avgDays     = complaintRepository.avgResolutionDays();
        String topWard     = complaintRepository.findWardWithMostOpenComplaints();
        String topDept     = complaintRepository.findDeptWithMostBacklog();

        long resolvedToday = complaintRepository.findAll().stream()
                .filter(c -> c.getStatus() == Complaint.Status.RESOLVED
                        && c.getUpdatedAt() != null
                        && c.getUpdatedAt().isAfter(
                        LocalDateTime.now()
                                .withHour(0).withMinute(0).withSecond(0)))
                .count();

        return AdminStatsResponse.builder()
                .totalComplaints(total)
                .resolvedToday(resolvedToday)
                .criticalActive(critical)
                .escalatedActive(escalated)
                .avgResolutionDays(avgDays != null
                        ? Math.round(avgDays * 10.0) / 10.0 : 0.0)
                .totalCitizens(citizens)
                .wardWithMostComplaints(topWard)
                .deptWithMostBacklog(topDept)
                .build();
    }

    // ── GET /admin/health-score ──────────────────────────────────
    public HealthScoreResponse getHealthScore() {
        long   total      = complaintRepository.count();
        long   resolved   = complaintRepository.countResolvedComplaints();
        long   critical   = complaintRepository.countCriticalActive();
        Double avgDays    = complaintRepository.avgResolutionDays();
        long   totalWards = wardRepository.count();

        double resolutionRate = total > 0
                ? (resolved * 100.0 / total) : 100.0;
        double avgResponseHours = avgDays != null ? avgDays * 24 : 0;
        long   wardsWithActivity = complaintRepository.findAll().stream()
                .map(c -> c.getWard().getId()).distinct().count();
        double wardCoverage = totalWards > 0
                ? (wardsWithActivity * 100.0 / totalWards) : 0.0;

        double raw = resolutionRate * 0.40
                + Math.max(0, 100 - avgResponseHours * 0.5) * 0.30
                + Math.max(0, 100 - critical * 5.0) * 0.20
                + wardCoverage * 0.10;

        int score = (int) Math.min(100, Math.max(0, raw));

        String label = score >= 80 ? "EXCELLENT"
                : score >= 60 ? "GOOD"
                : score >= 40 ? "FAIR"
                : score >= 20 ? "POOR"
                : "CRITICAL";

        return HealthScoreResponse.builder()
                .score(score).label(label).trend("STABLE")
                .components(HealthScoreResponse.Components.builder()
                        .resolutionRate(Math.round(resolutionRate * 10.0) / 10.0)
                        .avgResponseHours(Math.round(avgResponseHours * 10.0) / 10.0)
                        .criticalBacklog(critical)
                        .wardCoverage(Math.round(wardCoverage * 10.0) / 10.0)
                        .build())
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    // ── GET /admin/complaints ────────────────────────────────────
    public Page<OfficerComplaintResponse> getAllComplaints(
            int page, int size, String status, Integer wardId,
            String department, String severity, Boolean escalated, String sort) {

        Sort     sortOrder = resolveSort(sort);
        Pageable pageable  = PageRequest.of(page, size, sortOrder);
        return complaintRepository.findAll(pageable).map(this::toResponse);
    }

    // ── GET /admin/analytics/trends ──────────────────────────────
    public List<TrendDataPoint> getTrends(int days) {
        LocalDate         today = LocalDate.now();
        DateTimeFormatter fmt   = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<Complaint>   all   = complaintRepository.findAll();
        List<TrendDataPoint> result = new ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String    ds   = date.format(fmt);

            long submitted = all.stream()
                    .filter(c -> c.getCreatedAt() != null
                            && c.getCreatedAt().toLocalDate().equals(date))
                    .count();
            long resolved = all.stream()
                    .filter(c -> c.getStatus() == Complaint.Status.RESOLVED
                            && c.getUpdatedAt() != null
                            && c.getUpdatedAt().toLocalDate().equals(date))
                    .count();
            long critical = all.stream()
                    .filter(c -> c.getCreatedAt() != null
                            && c.getCreatedAt().toLocalDate().equals(date)
                            && c.getAiSeverity() >= 8)
                    .count();

            result.add(TrendDataPoint.builder()
                    .date(ds)
                    .submitted((int) submitted)
                    .resolved((int) resolved)
                    .critical((int) critical)
                    .build());
        }
        return result;
    }

    // ── GET /admin/analytics/by-ward ─────────────────────────────
    public List<WardAnalyticsResponse> getByWard() {
        return wardRepository.findAll().stream().map(ward -> {
            List<Complaint> wc = complaintRepository
                    .findByWardId(ward.getId(), Pageable.unpaged()).getContent();

            long open     = wc.stream()
                    .filter(c -> c.getStatus() == Complaint.Status.OPEN).count();
            long resolved = wc.stream()
                    .filter(c -> c.getStatus() == Complaint.Status.RESOLVED).count();
            double avg    = wc.stream()
                    .filter(c -> c.getStatus() == Complaint.Status.RESOLVED
                            && c.getUpdatedAt() != null)
                    .mapToLong(c -> ChronoUnit.DAYS.between(
                            c.getCreatedAt(), c.getUpdatedAt()))
                    .average().orElse(0.0);

            return WardAnalyticsResponse.builder()
                    .wardId(ward.getId()).wardName(ward.getWardName())
                    .total((long) wc.size()).open(open).resolved(resolved)
                    .avgResolutionDays(Math.round(avg * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());
    }

    // ── GET /admin/analytics/by-department ───────────────────────
    public List<DeptAnalyticsResponse> getByDepartment() {
        List<Complaint> all   = complaintRepository.findAll();
        long            total = all.size();

        return all.stream()
                .collect(Collectors.groupingBy(Complaint::getAiDepartment))
                .entrySet().stream()
                .map(entry -> {
                    List<Complaint> list = entry.getValue();
                    long open     = list.stream()
                            .filter(c -> c.getStatus() == Complaint.Status.OPEN)
                            .count();
                    long resolved = list.stream()
                            .filter(c -> c.getStatus() == Complaint.Status.RESOLVED)
                            .count();
                    double pct = total > 0
                            ? Math.round(list.size() * 1000.0 / total) / 10.0 : 0;
                    return DeptAnalyticsResponse.builder()
                            .department(entry.getKey())
                            .total((long) list.size())
                            .open(open).resolved(resolved).percentage(pct)
                            .build();
                })
                .sorted(Comparator.comparingLong(DeptAnalyticsResponse::getTotal)
                        .reversed())
                .collect(Collectors.toList());
    }

    // ── GET /admin/activity-log ───────────────────────────────────
    public Page<ActivityLogResponse> getActivityLog(
            int page, int size, UUID userId, String action) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logs;

        if (userId != null && action != null) {
            logs = activityLogRepository
                    .findByUserIdAndActionOrderByPerformedAtDesc(
                            userId, ActivityLog.Action.valueOf(action), pageable);
        } else if (userId != null) {
            logs = activityLogRepository
                    .findByUserIdOrderByPerformedAtDesc(userId, pageable);
        } else if (action != null) {
            logs = activityLogRepository
                    .findByActionOrderByPerformedAtDesc(
                            ActivityLog.Action.valueOf(action), pageable);
        } else {
            logs = activityLogRepository
                    .findAllByOrderByPerformedAtDesc(pageable);
        }

        return logs.map(l -> ActivityLogResponse.builder()
                .logId(l.getId()).userId(l.getUserId())
                .userName(l.getUserName()).role(l.getRole().name())
                .action(l.getAction().name()).complaintId(l.getComplaintId())
                .detail(l.getDetail()).performedAt(l.getPerformedAt())
                .build());
    }

    // ── GET /admin/users ─────────────────────────────────────────
    public List<UserResponse> getUsers(String role, Integer wardId,
                                       Boolean active) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != User.Role.ADMIN)
                .filter(u -> role   == null || u.getRole().name().equals(role))
                .filter(u -> wardId == null
                        || (u.getWard() != null
                        && u.getWard().getId().equals(wardId)))
                .filter(u -> active == null || u.getActive().equals(active))
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    // ── POST /admin/users ────────────────────────────────────────
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "Email already registered: " + request.getEmail()
            );
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        if (role == User.Role.WARD_OFFICER && request.getWardId() == null) {
            throw new BadRequestException("wardId required for WARD_OFFICER");
        }
        if (role == User.Role.DEPT_HEAD
                && (request.getDepartment() == null
                || request.getDepartment().isBlank())) {
            throw new BadRequestException("department required for DEPT_HEAD");
        }

        String rawPassword = generatePassword();

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(true);

        if (role == User.Role.WARD_OFFICER) {
            Ward ward = wardRepository.findById(request.getWardId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Ward not found: " + request.getWardId()
                    ));
            user.setWard(ward);
        }
        if (role == User.Role.DEPT_HEAD) {
            user.setDepartment(request.getDepartment());
        }

        user = userRepository.save(user);

        // Log the generated password to console for dev use
        log.info("New account: {} / password: {}", user.getEmail(), rawPassword);

        return toUserResponse(user);
    }

    // ── PUT /admin/users/{id} ────────────────────────────────────
    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = findUser(id);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) {
            if (!request.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException(
                        "Email already taken: " + request.getEmail()
                );
            }
            user.setEmail(request.getEmail());
        }
        if (request.getWardId() != null
                && user.getRole() == User.Role.WARD_OFFICER) {
            Ward ward = wardRepository.findById(request.getWardId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Ward not found: " + request.getWardId()
                    ));
            user.setWard(ward);
        }
        if (request.getDepartment() != null
                && user.getRole() == User.Role.DEPT_HEAD) {
            user.setDepartment(request.getDepartment());
        }

        return toUserResponse(userRepository.save(user));
    }

    // ── DELETE /admin/users/{id} ─────────────────────────────────
    @Transactional
    public void deleteUser(UUID id) {
        if (id.equals(securityUtil.getCurrentUserId())) {
            throw new BadRequestException("Cannot delete your own account");
        }
        User user = findUser(id);
        userRepository.delete(user);
        log.info("User deleted: {}", user.getEmail());
    }

    // ── PATCH /admin/users/{id}/status ───────────────────────────
    @Transactional
    public UserResponse updateUserStatus(UUID id,
                                         UpdateUserStatusRequest request) {
        User user = findUser(id);
        user.setActive(request.getActive());
        return toUserResponse(userRepository.save(user));
    }

    // ── Private helpers ──────────────────────────────────────────

    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + id
                ));
    }

    private Sort resolveSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "priorityScore");
        return switch (sort.toUpperCase()) {
            case "DATE"     -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "SEVERITY" -> Sort.by(Sort.Direction.DESC, "aiSeverity");
            default         -> Sort.by(Sort.Direction.DESC, "priorityScore");
        };
    }

    private String resolveSeverityLabel(int severity) {
        if (severity >= 9) return "CRITICAL";
        if (severity >= 7) return "HIGH";
        if (severity >= 4) return "MEDIUM";
        return "LOW";
    }

    private String generatePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private OfficerComplaintResponse toResponse(Complaint c) {
        return OfficerComplaintResponse.builder()
                .complaintId(c.getId()).trackingId(c.getTrackingId())
                .citizenName(c.getCitizenName()).citizenPhone("****hidden")
                .aiCategory(c.getAiCategory().name())
                .aiSeverity(c.getAiSeverity())
                .severityLabel(resolveSeverityLabel(c.getAiSeverity()))
                .priorityScore(c.getPriorityScore())
                .status(c.getStatus().name()).upvotes(c.getUpvotes())
                .description(c.getDescription()).photoUrl(c.getPhotoUrl())
                .latitude(c.getLatitude().doubleValue())
                .longitude(c.getLongitude().doubleValue())
                .escalated(c.getEscalated())
                .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt())
                .build();
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .userId(u.getId()).name(u.getName()).email(u.getEmail())
                .role(u.getRole().name())
                .wardId(u.getWard() != null ? u.getWard().getId() : null)
                .wardName(u.getWard() != null ? u.getWard().getWardName() : null)
                .department(u.getDepartment()).active(u.getActive())
                .createdAt(u.getCreatedAt()).lastLoginAt(u.getLastLoginAt())
                .build();
    }
}