package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "HoaDon")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class HoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maHoaDon;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDonHang", nullable = false, unique = true)
    private DonHang donHang;

    @Column(name = "SoHoaDon", unique = true)
    private String soHoaDon;

    @Column(name = "NgayXuat")
    private LocalDateTime ngayXuat = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNhanVienXuat", nullable = false)
    private NhanVien nhanVienXuat;

    @Column(name = "TongTienThanhToan", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongTienThanhToan;
}