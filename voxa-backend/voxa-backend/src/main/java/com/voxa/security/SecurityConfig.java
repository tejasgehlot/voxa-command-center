package com.voxa.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter      jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s ->
                        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Public Auth ──────────────────────────────────
                        .requestMatchers(POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers(POST, "/api/v1/auth/refresh").permitAll()

                        // ── Public Complaints ────────────────────────────
                        .requestMatchers(POST, "/api/v1/ai/analyse").permitAll()
                        .requestMatchers(POST, "/api/v1/complaints").permitAll()
                        .requestMatchers(GET,  "/api/v1/complaints").permitAll()
                        .requestMatchers(GET,  "/api/v1/complaints/track").permitAll()
                        .requestMatchers(GET,  "/api/v1/complaints/{id}").permitAll()
                        .requestMatchers(GET,  "/api/v1/map/pins").permitAll()
                        .requestMatchers(POST, "/api/v1/complaints/{id}/upvote").permitAll()
                        .requestMatchers(POST, "/api/v1/complaints/{id}/comments").permitAll()
                        .requestMatchers(GET,  "/api/v1/complaints/{id}/comments").permitAll()

                        // ── Public Stats & Wards ─────────────────────────
                        .requestMatchers(GET, "/api/v1/stats/public").permitAll()
                        .requestMatchers(GET, "/api/v1/wards").permitAll()

                        // ── Ward Officer ─────────────────────────────────
                        .requestMatchers("/api/v1/officer/**")
                        .hasRole("WARD_OFFICER")

                        // ── Department Head ──────────────────────────────
                        .requestMatchers("/api/v1/dept/**")
                        .hasRole("DEPT_HEAD")

                        // ── Admin ────────────────────────────────────────
                        .requestMatchers("/api/v1/admin/**")
                        .hasRole("ADMIN")

                        // ── Notifications (any authority) ────────────────
                        .requestMatchers("/api/v1/notifications/**")
                        .hasAnyRole("WARD_OFFICER", "DEPT_HEAD", "ADMIN")

                        // ── Logout ───────────────────────────────────────
                        .requestMatchers(POST, "/api/v1/auth/logout")
                        .hasAnyRole("WARD_OFFICER", "DEPT_HEAD", "ADMIN")

                        // ── Everything else needs auth ───────────────────
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}