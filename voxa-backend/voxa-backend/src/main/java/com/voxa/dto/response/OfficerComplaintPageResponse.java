package com.voxa.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OfficerComplaintPageResponse {
    private List<OfficerComplaintResponse> content;
    private WardStatsResponse              wardStats;
    private long                           totalElements;
    private int                            totalPages;
    private int                            currentPage;
}