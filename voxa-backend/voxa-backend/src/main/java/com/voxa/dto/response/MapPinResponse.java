package com.voxa.dto.response;

import lombok.*;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MapPinResponse {
    private UUID    complaintId;
    private Double  latitude;
    private Double  longitude;
    private Integer severity;
    private String  category;
    private String  status;
    private Integer upvotes;
    private Boolean escalated;
}