package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ThongTinGiaoHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ThongTinGiaoHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maGiaoHang;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDonHang", nullable = false, unique = true)
    private DonHang donHang;

    @Column(name = "DonViVanChuyen")
    private String donViVanChuyen;

    @Column(name = "MaVanDon")
    private String maVanDon;

    @Column(name = "PhiVanChuyen", precision = 18, scale = 2)
    private BigDecimal phiVanChuyen = BigDecimal.ZERO;

    @Column(name = "TrangThaiGiaoHang")
    private String trangThaiGiaoHang;
}