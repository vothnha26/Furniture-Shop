package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "HangThanhVien")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class HangThanhVien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maHangThanhVien;

    @Column(name = "TenHang", nullable = false, unique = true)
    private String tenHang;

    @Column(name = "DiemToiThieu", nullable = false)
    private Integer diemToiThieu = 0;

    @Column(name = "SoTienToiThieu")
    private BigDecimal soTienToiThieu = BigDecimal.ZERO; // Tổng chi tiêu tối thiểu (VND)

    @Column(name = "PhanTramGiamGia")
    private BigDecimal phanTramGiamGia = BigDecimal.ZERO; // Phần trăm giảm giá

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String moTa; // Mô tả hạng thành viên

    @Column(name = "MauSac")
    private String mauSac; // Màu sắc hiển thị UI (hex color)

    @Column(name = "UuDai", columnDefinition = "TEXT")
    private String uuDai; // Danh sách ưu đãi (JSON string)

    @Column(name = "TrangThai")
    private Boolean trangThai = true; // Trạng thái kích hoạt

    @Column(name = "ThuTu")
    private Integer thuTu = 0; // Thứ tự sắp xếp

    @Column(name = "Icon")
    private String icon; // Tên icon cho frontend
}