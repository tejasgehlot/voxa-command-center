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

@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient   httpClient   = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    // ── Public method ─────────────────────────────────────────────
    public GeminiAnalysisResult analysePhoto(MultipartFile photo,
                                             String description) {
        try {
            log.info("Starting Gemini AI analysis...");

            String base64Image = Base64.getEncoder()
                    .encodeToString(photo.getBytes());
            String mimeType    = resolveMimeType(photo.getContentType());
            String prompt      = buildPrompt(description);
            String requestBody = buildRequestBody(base64Image, mimeType, prompt);

            String urlWithKey  = apiUrl + "?key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlWithKey))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );

            log.info("Gemini API responded with status: {}", response.statusCode());

            if (response.statusCode() != 200) {
                log.error("Gemini API error: {}", response.body());
                throw new BadRequestException(
                        "AI analysis failed. Please upload a clearer photo."
                );
            }

            return parseResponse(response.body());

        } catch (IOException | InterruptedException e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            throw new BadRequestException(
                    "AI analysis service unavailable. Please try again."
            );
        }
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

    private String buildRequestBody(String base64Image,
                                    String mimeType,
                                    String prompt) throws IOException {
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
                    "maxOutputTokens": 8192
                  }
                }
                """.formatted(mimeType, base64Image, escapedPrompt);
    }

    private GeminiAnalysisResult parseResponse(String rawBody) {
        try {
            JsonNode root = objectMapper.readTree(rawBody);

            // Gemini response: candidates[0].content.parts[0].text
            String text = root
                    .at("/candidates/0/content/parts/0/text")
                    .asText();

            System.out.println("=================================");
            System.out.println(text);
            System.out.println("=================================");

            // Strip markdown fences if present
            text = text.replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*",     "")
                    .strip();

            log.info("Gemini raw text: {}", text);

            GeminiAnalysisResult result = objectMapper.readValue(
                    text, GeminiAnalysisResult.class
            );

            result.setCategory(sanitizeCategory(result.getCategory()));

            log.info("Gemini analysis done — Category: {}, Severity: {}",
                    result.getCategory(), result.getSeverity());

            return result;

        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
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