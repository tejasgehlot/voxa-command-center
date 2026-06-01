package com.voxa.repository;

import com.voxa.entity.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends
        JpaRepository<Complaint, UUID>,
        JpaSpecificationExecutor<Complaint> {

    Optional<Complaint> findByTrackingId(String trackingId);

    Page<Complaint> findByWardId(Integer wardId, Pageable pageable);

    Page<Complaint> findByAiDepartment(String aiDepartment, Pageable pageable);

    Page<Complaint> findByWardIdAndStatus(
            Integer wardId,
            Complaint.Status status,
            Pageable pageable
    );

    Page<Complaint> findByCitizenPhone(String citizenPhone, Pageable pageable);

    Optional<Complaint> findByCitizenPhoneAndTrackingId(
            String citizenPhone,
            String trackingId
    );

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status != 'RESOLVED'")
    Long countActiveComplaints();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = 'RESOLVED'")
    Long countResolvedComplaints();

    @Query("""
            SELECT COUNT(c) FROM Complaint c
            WHERE c.status = 'RESOLVED'
            AND MONTH(c.updatedAt) = MONTH(CURRENT_DATE)
            AND YEAR(c.updatedAt) = YEAR(CURRENT_DATE)
            """)
    Long countResolvedThisMonth();

    @Query("SELECT AVG(DATEDIFF(c.updatedAt, c.createdAt)) FROM Complaint c WHERE c.status = 'RESOLVED'")
    Double avgResolutionDays();

    @Query("SELECT COUNT(DISTINCT c.citizenPhone) FROM Complaint c")
    Long countUniqueCitizens();

    @Query("""
            SELECT c.ward.wardName FROM Complaint c
            WHERE c.status != 'RESOLVED'
            GROUP BY c.ward.id, c.ward.wardName
            ORDER BY COUNT(c) DESC
            LIMIT 1
            """)
    String findWardWithMostOpenComplaints();

    @Query("""
            SELECT c.aiDepartment FROM Complaint c
            WHERE c.status != 'RESOLVED'
            GROUP BY c.aiDepartment
            ORDER BY COUNT(c) DESC
            LIMIT 1
            """)
    String findDeptWithMostBacklog();

    @Query("""
            SELECT COUNT(c) FROM Complaint c
            WHERE c.status != 'RESOLVED'
            AND c.aiSeverity >= 8
            """)
    Long countCriticalActive();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.escalated = true AND c.status != 'RESOLVED'")
    Long countEscalatedActive();
}