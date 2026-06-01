package com.voxa.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.voxa.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadComplaintPhoto(MultipartFile file) {
        // Validate file
        validateFile(file);

        try {
            // Generate unique public ID
            String publicId = "voxa/complaints/" + UUID.randomUUID();

            // Upload to Cloudinary
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id",       publicId,
                            "resource_type",   "image",
                            "transformation",  "q_auto,f_auto",
                            "overwrite",       true
                    )
            );

            String url = (String) result.get("secure_url");
            log.info("Photo uploaded to Cloudinary: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Failed to upload photo to Cloudinary: {}", e.getMessage());
            throw new BadRequestException("Failed to upload photo. Please try again.");
        }
    }

    public void deletePhoto(String photoUrl) {
        try {
            // Extract public ID from URL
            String publicId = extractPublicId(photoUrl);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Photo deleted from Cloudinary: {}", publicId);
        } catch (IOException e) {
            log.warn("Failed to delete photo from Cloudinary: {}", e.getMessage());
        }
    }

    // ── Private helpers ──────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Photo file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/jpeg") &&
                        !contentType.equals("image/png") &&
                        !contentType.equals("image/jpg"))) {
            throw new BadRequestException(
                    "Invalid file type. Only JPEG and PNG are allowed."
            );
        }

        long maxSize = 10L * 1024 * 1024; // 10 MB
        if (file.getSize() > maxSize) {
            throw new BadRequestException(
                    "File size exceeds 10 MB limit."
            );
        }
    }

    private String extractPublicId(String url) {
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/{version}/{publicId}.{ext}
        String[] parts = url.split("/upload/");
        if (parts.length < 2) return url;
        String afterUpload = parts[1];
        // Remove version if present (v1234567890/)
        if (afterUpload.startsWith("v")) {
            afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
        }
        // Remove extension
        int dotIndex = afterUpload.lastIndexOf(".");
        return dotIndex > 0 ? afterUpload.substring(0, dotIndex) : afterUpload;
    }
}