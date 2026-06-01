package com.voxa.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ComplaintDetailResponse {
    private UUID          complaintId;
    private String        trackingId;
    private String        aiCategory;
    private Integer       aiSeverity;
    private String        severityLabel;
    private String        aiDepartment;
    private String        aiDepartmentGu;
    private String        aiLetterEn;
    private String        aiLetterGu;
    private String        aiSummary;
    private String        description;
    private String        status;
    private String        wardName;
    private String        photoUrl;
    private Integer       upvotes;
    private Integer       commentCount;
    private Boolean       escalated;
    private List<TimelineResponse> timeline;
    private List<CommentResponse>  comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}