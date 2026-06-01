package com.voxa.repository;

import com.voxa.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    Page<ActivityLog> findAllByOrderByPerformedAtDesc(Pageable pageable);

    Page<ActivityLog> findByUserIdOrderByPerformedAtDesc(UUID userId, Pageable pageable);

    Page<ActivityLog> findByActionOrderByPerformedAtDesc(
            ActivityLog.Action action,
            Pageable pageable
    );

    Page<ActivityLog> findByUserIdAndActionOrderByPerformedAtDesc(
            UUID userId,
            ActivityLog.Action action,
            Pageable pageable
    );
}