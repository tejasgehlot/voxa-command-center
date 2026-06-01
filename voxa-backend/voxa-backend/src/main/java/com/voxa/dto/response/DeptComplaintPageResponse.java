package com.voxa.dto.response;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DeptComplaintPageResponse {
    private List<OfficerComplaintResponse> content;
    private DeptStatsResponse              deptStats;
    private long                           totalElements;
    private int                            totalPages;
    private int                            currentPage;
}