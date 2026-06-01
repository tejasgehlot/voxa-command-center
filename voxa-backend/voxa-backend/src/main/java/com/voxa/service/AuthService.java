package com.voxa.service;

import com.voxa.dto.request.LoginRequest;
import com.voxa.dto.request.RefreshTokenRequest;
import com.voxa.dto.response.AuthResponse;
import com.voxa.entity.ActivityLog;
import com.voxa.entity.User;
import com.voxa.exception.BadRequestException;
import com.voxa.repository.ActivityLogRepository;
import com.voxa.repository.UserRepository;
import com.voxa.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final JwtUtil               jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        // 1. Authenticate credentials
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadRequestException("Invalid email or password");
        }

        // 2. Load user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        // 3. Check role matches
        if (!user.getRole().equals(request.getRole())) {
            throw new BadRequestException(
                    "Role mismatch. This account is registered as: " + user.getRole()
            );
        }

        // 4. Check account is active
        if (!user.getActive()) {
            throw new BadRequestException("Account is suspended. Contact admin.");
        }

        // 5. Update last login
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        // 6. Generate tokens
        Integer wardId     = user.getWard() != null ? user.getWard().getId() : null;
        String  wardName   = user.getWard() != null ? user.getWard().getWardName() : null;
        String  department = user.getDepartment();

        String accessToken  = jwtUtil.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name(),
                wardId, department);
        String refreshToken = jwtUtil.generateRefreshToken(
                user.getId(), user.getEmail());

        // 7. Log the activity
        ActivityLog log = new ActivityLog();
        log.setUserId(user.getId());
        log.setUserName(user.getName());
        log.setRole(user.getRole());
        log.setAction(ActivityLog.Action.LOGIN);
        log.setDetail("Login by " + user.getName() + " (" + user.getRole() + ")");
        activityLogRepository.save(log);

        // 8. Build and return response
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .name(user.getName())
                .role(user.getRole().name())
                .wardId(wardId)
                .wardName(wardName)
                .department(department)
                .build();
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        if (!jwtUtil.isTokenValid(token) || jwtUtil.isTokenExpired(token)) {
            throw new BadRequestException("Refresh token is invalid or expired");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        Integer wardId     = user.getWard() != null ? user.getWard().getId() : null;
        String  department = user.getDepartment();

        String newAccessToken  = jwtUtil.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name(),
                wardId, department);
        String newRefreshToken = jwtUtil.generateRefreshToken(
                user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .userId(user.getId())
                .name(user.getName())
                .role(user.getRole().name())
                .wardId(wardId)
                .wardName(user.getWard() != null ? user.getWard().getWardName() : null)
                .department(department)
                .build();
    }

    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadRequestException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        userRepository.findByEmail(email).ifPresent(user -> {
            ActivityLog log = new ActivityLog();
            log.setUserId(user.getId());
            log.setUserName(user.getName());
            log.setRole(user.getRole());
            log.setAction(ActivityLog.Action.LOGOUT);
            log.setDetail("Logout by " + user.getName());
            activityLogRepository.save(log);
        });
    }
}