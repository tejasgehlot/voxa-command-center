package com.voxa.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voxa.dto.response.GeminiAnalysisResult;
import com.voxa.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.List;

@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.base-url}")
    private String apiBaseUrl;

    // Fallback chain — tried in this exact order.
    // Most capable + most likely available first, oldest/most stable last.
    private static final List<String> MODEL_FALLBACK_CHAIN = List.of(
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient   httpClient   = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    // ── Public method ─────────────────────────────────────────────
    public GeminiAnalysisResult analysePhoto(MultipartFile photo, String description) {

        String base64Image;
        String mimeType;
        try {
            base64Image = Base64.getEncoder().encodeToString(photo.getBytes());
            mimeType    = resolveMimeType(photo.getContentType());
        } catch (IOException e) {
            throw new BadRequestException("Could not read the uploaded photo. Please try again.");
        }

        String prompt = buildPrompt(description);

        Exception lastError = null;

        for (String model : MODEL_FALLBACK_CHAIN) {
            try {
                log.info("Attempting AI analysis with model: {}", model);

                String requestBody = buildRequestBody(base64Image, mimeType, prompt);
                String urlWithKey   = apiBaseUrl + "/" + model + ":generateContent?key=" + apiKey;

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(urlWithKey))
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(45))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<String> response = httpClient.send(
                        request, HttpResponse.BodyHandlers.ofString()
                );

                log.info("Model {} responded with status: {}", model, response.statusCode());

                // Overloaded or rate-limited — move to next model immediately, no retry on same model
                if (response.statusCode() == 503 || response.statusCode() == 429) {
                    log.warn("Model {} is overloaded (status {}). Falling back to next model...",
                            model, response.statusCode());
                    continue;
                }

                if (response.statusCode() != 200) {
                    log.error("Model {} returned error: {}", model, response.body());
                    lastError = new RuntimeException("Model " + model + " failed with status " + response.statusCode());
                    continue;
                }

                // Success — parse and return immediately
                GeminiAnalysisResult result = parseResponse(response.body());
                log.info("AI analysis succeeded using model: {}", model);
                return result;

            } catch (IOException | InterruptedException e) {
                log.error("Model {} call failed: {}", model, e.getMessage());
                lastError = e;
            }
        }

        // All models in the fallback chain failed
        log.error("All AI models in fallback chain failed.", lastError);
        throw new BadRequestException(
            "AI service is temporarily busy across all providers. Please try again in a moment."
        );
    }

    // ── Private helpers ───────────────────────────────────────────

    private String buildPrompt(String description) {
        String desc = (description != null && !description.isBlank())
                ? description
                : "No description provided.";

        return """
                You are an AI assistant for VOXA, a civic complaint platform for Vadodara, India.
                Analyse the uploaded image carefully and return ONLY a valid JSON object.
                Do not include any text, explanation, or markdown fences outside the JSON.

                Return this exact JSON structure:
                {
                  "category":      "POTHOLE|GARBAGE|STREETLIGHT|WATER|SEWAGE|ROAD_DAMAGE|OTHER",
                  "severity":       <integer 1-10>,
                  "severityLabel": "LOW|MEDIUM|HIGH|CRITICAL",
                  "department":    "<VMC department in English>",
                  "departmentGu":  "<VMC department in Gujarati script>",
                  "summary":       "<1-2 sentence English description of what you see>",
                  "urgency":       "<e.g. 2 hours | 3 days | 1 week>",
                  "letterEn":      "<full official English complaint letter to VMC Commissioner Vadodara>",
                  "letterGu":      "<full official Gujarati complaint letter to VMC Commissioner Vadodara>",
                  "confidence":     <decimal 0.0-1.0>
                }

                Severity guide:
                  1-3  = LOW      (minor inconvenience)
                  4-6  = MEDIUM   (affects daily life)
                  7-8  = HIGH     (safety risk)
                  9-10 = CRITICAL (immediate danger)

                VMC departments:
                  Roads and Infrastructure
                  Sanitation and Waste Management
                  Water Supply
                  Street Lighting
                  Drainage and Sewage
                  Parks and Gardens
                  Building and Construction

                Citizen description: %s
                """.formatted(desc);
    }

    private String buildRequestBody(String base64Image, String mimeType, String prompt) throws IOException {
        String escapedPrompt = objectMapper.writeValueAsString(prompt);
        escapedPrompt = escapedPrompt.substring(1, escapedPrompt.length() - 1);

        return """
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "inline_data": {
                            "mime_type": "%s",
                            "data": "%s"
                          }
                        },
                        {
                          "text": "%s"
                        }
                      ]
                    }
                  ],
                  "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 2048
                  }
                }
                """.formatted(mimeType, base64Image, escapedPrompt);
    }

    private GeminiAnalysisResult parseResponse(String rawBody) {
        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String text = root.at("/candidates/0/content/parts/0/text").asText();

            text = text.replaceAll("(?s)```json\\s*", "")
                       .replaceAll("(?s)```\\s*",     "")
                       .strip();

            log.info("AI raw text: {}", text);

            GeminiAnalysisResult result = objectMapper.readValue(text, GeminiAnalysisResult.class);
            result.setCategory(sanitizeCategory(result.getCategory()));

            log.info("Analysis complete — Category: {}, Severity: {}",
                    result.getCategory(), result.getSeverity());

            return result;

        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", e.getMessage());
            throw new BadRequestException(
                "AI could not analyse this photo. Please upload a clearer image."
            );
        }
    }

    private String sanitizeCategory(String category) {
        if (category == null) return "OTHER";
        return switch (category.toUpperCase().trim()) {
            case "POTHOLE"     -> "POTHOLE";
            case "GARBAGE"     -> "GARBAGE";
            case "STREETLIGHT" -> "STREETLIGHT";
            case "WATER"       -> "WATER";
            case "SEWAGE"      -> "SEWAGE";
            case "ROAD_DAMAGE" -> "ROAD_DAMAGE";
            default            -> "OTHER";
        };
    }

    private String resolveMimeType(String contentType) {
        if (contentType == null) return "image/jpeg";
        return switch (contentType.toLowerCase()) {
            case "image/png"  -> "image/png";
            case "image/webp" -> "image/webp";
            default           -> "image/jpeg";
        };
    }
}