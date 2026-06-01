package com.voxa.util;

import com.voxa.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SecurityUtil {

    public CustomUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        return (CustomUserDetails) auth.getPrincipal();
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public String getCurrentUserRole() {
        return getCurrentUser().getRole();
    }

    public Integer getCurrentUserWardId() {
        return getCurrentUser().getWardId();
    }

    public String getCurrentUserDepartment() {
        return getCurrentUser().getDepartment();
    }

    public String getCurrentUserName() {
        return getCurrentUser().getUsername();
    }
}