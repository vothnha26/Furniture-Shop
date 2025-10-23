package com.noithat.qlnt.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ThongTinGiaoHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ThongTinGiaoHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maGiaoHang;

    @JsonIgnore  // Prevent circular reference when serializing to JSON
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDonHang", nullable = false, unique = true)
    private DonHang donHang;

    // ----- THÔNG TIN VẬN HÀNH (Được admin cập nhật sau) -----
    @Column(name = "DonViVanChuyen", columnDefinition = "NVARCHAR(100)")
    private String donViVanChuyen; // Ví dụ: "Giao Hàng Tiết Kiệm"

    @Column(name = "MaVanDon", columnDefinition = "NVARCHAR(100)")
    private String maVanDon; // Mã để theo dõi đơn hàng

    @Column(name = "TrangThaiGiaoHang", columnDefinition = "NVARCHAR(50)")
    private String trangThaiGiaoHang; // Ví dụ: "Đang lấy hàng", "Đang giao hàng"
}