package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "BienTheSanPham")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BienTheSanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maBienThe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaSanPham", nullable = false)
    private SanPham sanPham;

    @Column(name = "SKU", unique = true, nullable = false)
    private String sku;

    @Column(name = "GiaBan", precision = 18, scale = 2, nullable = false)
    private BigDecimal giaBan;

    @Column(name = "SoLuongTon", nullable = false)
    private Integer soLuongTon;
}


