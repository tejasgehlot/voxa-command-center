package com.voxa.config;

import com.voxa.entity.User;
import com.voxa.entity.Ward;
import com.voxa.repository.UserRepository;
import com.voxa.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class AuthoritySeeder implements CommandLineRunner {

    private final UserRepository    userRepository;
    private final WardRepository    wardRepository;
    private final PasswordEncoder   passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedWardOfficer();
        seedDeptHead();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@voxa.in")) return;

        User admin = new User();
        admin.setName("Admin User");
        admin.setEmail("admin@voxa.in");
        admin.setPasswordHash(passwordEncoder.encode("Test@1234"));
        admin.setRole(User.Role.ADMIN);
        admin.setActive(true);

        userRepository.save(admin);
        log.info("Admin seeded: admin@voxa.in / Test@1234");
    }

    private void seedWardOfficer() {
        if (userRepository.existsByEmail("officer@voxa.in")) return;

        Ward ward = wardRepository.findById(4).orElse(null);

        User officer = new User();
        officer.setName("Officer Alkapuri");
        officer.setEmail("officer@voxa.in");
        officer.setPasswordHash(passwordEncoder.encode("Test@1234"));
        officer.setRole(User.Role.WARD_OFFICER);
        officer.setWard(ward);
        officer.setActive(true);

        userRepository.save(officer);
        log.info("Ward Officer seeded: officer@voxa.in / Test@1234 (Ward 4 - Alkapuri)");
    }

    private void seedDeptHead() {
        if (userRepository.existsByEmail("roads@voxa.in")) return;

        User deptHead = new User();
        deptHead.setName("Roads Dept Head");
        deptHead.setEmail("roads@voxa.in");
        deptHead.setPasswordHash(passwordEncoder.encode("Test@1234"));
        deptHead.setRole(User.Role.DEPT_HEAD);
        deptHead.setDepartment("Roads and Infrastructure");
        deptHead.setActive(true);

        userRepository.save(deptHead);
        log.info("Dept Head seeded: roads@voxa.in / Test@1234 (Roads and Infrastructure)");
    }
}