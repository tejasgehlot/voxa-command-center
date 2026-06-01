package com.voxa.service;

import com.voxa.dto.response.WardResponse;
import com.voxa.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WardService {

    private final WardRepository wardRepository;

    public List<WardResponse> getAllWards() {
        return wardRepository.findAll()
                .stream()
                .map(ward -> WardResponse.builder()
                        .id(ward.getId())
                        .wardName(ward.getWardName())
                        .wardNameGu(ward.getWardNameGu())
                        .zone(ward.getZone())
                        .build())
                .collect(Collectors.toList());
    }
}