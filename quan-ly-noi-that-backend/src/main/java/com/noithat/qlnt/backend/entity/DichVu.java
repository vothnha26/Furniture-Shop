package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "DichVu")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DichVu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maDichVu;

    @Column(name = "TenDichVu", nullable = false)
    private String tenDichVu;

    @Column(name = "MoTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "ChiPhi", precision = 18, scale = 2, nullable = false)
    private BigDecimal chiPhi;
}