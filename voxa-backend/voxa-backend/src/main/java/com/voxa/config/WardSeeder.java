package com.voxa.config;

import org.springframework.core.annotation.Order;

import com.voxa.entity.Ward;
import com.voxa.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class WardSeeder implements CommandLineRunner {

    private final WardRepository wardRepository;

    @Override
    public void run(String... args) {
        if (wardRepository.count() > 0) {
            log.info("Wards already seeded. Skipping.");
            return;
        }

        List<Ward> wards = List.of(
                new Ward("Wadi Ward",          "વાડી વૉર્ડ",           "North"),
                new Ward("Harni Ward",         "હર્ણી વૉર્ડ",           "North"),
                new Ward("Manjalpur Ward",     "માંજલપુર વૉર્ડ",        "South"),
                new Ward("Alkapuri Ward",      "અલ્કાપુરી વૉર્ડ",       "Central"),
                new Ward("Fatehgunj Ward",     "ફતેહગંજ વૉર્ડ",         "Central"),
                new Ward("Sayajigunj Ward",    "સયાજીગંજ વૉર્ડ",        "Central"),
                new Ward("Raopura Ward",       "રાઓ પુરા વૉર્ડ",        "East"),
                new Ward("Vadodara City Ward", "વડોદરા સિટી વૉર્ડ",     "Central"),
                new Ward("Akota Ward",         "અકોટા વૉર્ડ",           "West"),
                new Ward("Sama Ward",          "સામા વૉર્ડ",             "East"),
                new Ward("Gorwa Ward",         "ગોર્વા વૉર્ડ",           "North"),
                new Ward("Chhani Ward",        "છાણી વૉર્ડ",             "North"),
                new Ward("Nizampura Ward",     "નિઝામપુરા વૉર્ડ",        "East"),
                new Ward("Subhanpura Ward",    "સુભાનપુરા વૉર્ડ",        "West"),
                new Ward("Tarsali Ward",       "તરસાળી વૉર્ડ",           "South"),
                new Ward("Makarpura Ward",     "માકરપૂરા વૉર્ડ",         "South"),
                new Ward("Pratapnagar Ward",   "પ્રતાપ નગર વૉર્ડ",      "South"),
                new Ward("Gotri Ward",         "ગોત્રી વૉર્ડ",            "West"),
                new Ward("Vasna Ward",         "વાસણા વૉર્ડ",             "South")
        );


        wardRepository.saveAll(wards);
        log.info("Successfully seeded {} wards.", wards.size());
    }
}