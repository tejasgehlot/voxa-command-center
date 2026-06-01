package com.voxa.service;

import com.voxa.dto.response.PublicStatsResponse;
import com.voxa.repository.ComplaintRepository;
import com.voxa.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ComplaintRepository complaintRepository;
    private final WardRepository      wardRepository;

    public PublicStatsResponse getPublicStats() {
        Long   total        = complaintRepository.count();
        Long   resolved     = complaintRepository.countResolvedComplaints();
        Long   active       = complaintRepository.countActiveComplaints();
        Long   thisMonth    = complaintRepository.countResolvedThisMonth();
        Double avgDays      = complaintRepository.avgResolutionDays();
        int    totalWards   = (int) wardRepository.count();

        return PublicStatsResponse.builder()
                .totalComplaints(total)
                .totalResolved(resolved)
                .activeComplaints(active)
                .resolvedThisMonth(thisMonth)
                .avgResolutionDays(avgDays != null
                        ? Math.round(avgDays * 10.0) / 10.0 : 0.0)
                .totalWards(totalWards)
                .build();
    }
}