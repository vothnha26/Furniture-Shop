package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

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

    // ----- THÔNG TIN VẬN HÀNH (Được admin cập nhật sau) -----
    @Column(name = "DonViVanChuyen")
    private String donViVanChuyen; // Ví dụ: "Giao Hàng Tiết Kiệm"

    @Column(name = "MaVanDon")
    private String maVanDon; // Mã để theo dõi đơn hàng

    @Column(name = "TrangThaiGiaoHang")
    private String trangThaiGiaoHang; // Ví dụ: "Đang lấy hàng", "Đang giao hàng"
}