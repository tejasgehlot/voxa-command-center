package com.voxa.util;

import com.voxa.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class TrackingIdGenerator {

    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private final SecureRandom  random = new SecureRandom();
    private final ComplaintRepository complaintRepository;

    public String generate() {
        String id;
        // Keep generating until we get a unique one
        do {
            id = "VXA-" + randomChars(3);
        } while (complaintRepository.findByTrackingId(id).isPresent());
        return id;
    }

    private String randomChars(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}