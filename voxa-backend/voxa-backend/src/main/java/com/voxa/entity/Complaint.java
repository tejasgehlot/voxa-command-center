package com.voxa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @Column(name = "tracking_id", unique = true, nullable = false, length = 10)
    private String trackingId;

    @Column(name = "citizen_name", nullable = false, length = 100)
    private String citizenName;

    @Column(name = "citizen_phone", nullable = false, length = 64)
    private String citizenPhone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_id", nullable = false)
    private Ward ward;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_category", nullable = false, length = 20)
    private Category aiCategory;

    @Column(name = "ai_severity", nullable = false)
    private Integer aiSeverity;

    @Column(name = "ai_department", nullable = false, length = 100)
    private String aiDepartment;

    @Column(name = "ai_department_gu", nullable = false, length = 100)
    private String aiDepartmentGu;

    @Column(name = "ai_letter_en", columnDefinition = "TEXT")
    private String aiLetterEn;

    @Column(name = "ai_letter_gu", columnDefinition = "TEXT")
    private String aiLetterGu;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "ai_confidence", precision = 3, scale = 2)
    private BigDecimal aiConfidence;

    @Column(name = "priority_score", precision = 6, scale = 2)
    private BigDecimal priorityScore = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.OPEN;

    @Column(nullable = false)
    private Integer upvotes = 0;

    @Column(nullable = false)
    private Boolean escalated = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Category {
        POTHOLE, GARBAGE, STREETLIGHT, WATER, SEWAGE, ROAD_DAMAGE, OTHER
    }

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED
    }
}