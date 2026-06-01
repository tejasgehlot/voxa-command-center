package com.voxa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 👈 Tell MySQL to handle auto-increment
    @Column(name = "id")
    private Integer id;

    @Column(name = "ward_name", nullable = false, length = 80)
    private String wardName;

    @Column(name = "ward_name_gu", nullable = false, length = 80)
    private String wardNameGu;

    @Column(name = "zone", nullable = false, length = 40)
    private String zone;

    // 👈 Add this constructor so your Seeder can create Wards without forcing an ID
    public Ward(String wardName, String wardNameGu, String zone) {
        this.wardName = wardName;
        this.wardNameGu = wardNameGu;
        this.zone = zone;
    }
}
