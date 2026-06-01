package com.voxa.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voxa.entity.Ward;
import com.voxa.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NominatimService {

    private final WardRepository wardRepository;
    private final ObjectMapper   objectMapper = new ObjectMapper();
    private final HttpClient     httpClient   = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public Ward detectWard(BigDecimal latitude, BigDecimal longitude) {
        try {
            String url = String.format(
                    "https://nominatim.openstreetmap.org/reverse" +
                            "?lat=%s&lon=%s&format=json",
                    latitude, longitude
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "VOXA-CivicPlatform/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );

            JsonNode root    = objectMapper.readTree(response.body());
            JsonNode address = root.get("address");

            if (address != null) {
                String suburb = getTextSafely(address, "suburb");
                String city   = getTextSafely(address, "city_district");
                String area   = suburb != null ? suburb : city;

                if (area != null) {
                    Ward matched = matchWardByArea(area);
                    if (matched != null) {
                        log.info("Ward detected: {}", matched.getWardName());
                        return matched;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Nominatim detection failed: {}. Using default ward.", e.getMessage());
        }

        // Fallback — Alkapuri ward (central Vadodara)
        return wardRepository.findById(4)
                .orElseGet(() -> wardRepository.findAll().get(0));
    }

    private Ward matchWardByArea(String area) {
        List<Ward> wards = wardRepository.findAll();
        String areaLower = area.toLowerCase();
        return wards.stream()
                .filter(w -> areaLower.contains(
                        w.getWardName().toLowerCase()
                                .replace(" ward", "").trim()))
                .findFirst()
                .orElse(null);
    }

    private String getTextSafely(JsonNode node, String field) {
        JsonNode val = node.get(field);
        return (val != null && !val.isNull()) ? val.asText() : null;
    }
}