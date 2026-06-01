package com.voxa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaint_timeline")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Stage stage;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "internal_note", columnDefinition = "TEXT")
    private String internalNote;

    @Column(name = "actor_id", columnDefinition = "VARCHAR(36)")
    private UUID actorId;

    @Column(name = "actor_name", length = 100)
    private String actorName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Stage {
        SUBMITTED, AI_ANALYSED, ASSIGNED, IN_PROGRESS, RESOLVED
    }
}