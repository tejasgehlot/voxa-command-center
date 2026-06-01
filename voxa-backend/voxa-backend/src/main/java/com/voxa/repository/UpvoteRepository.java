package com.voxa.repository;

import com.voxa.entity.Upvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UpvoteRepository extends JpaRepository<Upvote, UUID> {

    boolean existsByComplaintIdAndCitizenPhone(UUID complaintId, String citizenPhone);
}