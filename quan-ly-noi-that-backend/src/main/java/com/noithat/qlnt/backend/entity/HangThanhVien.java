package com.noithat.qlnt.backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "HangThanhVien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HangThanhVien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maHangThanhVien;

    @Column(name = "TenHang", nullable = false, unique = true)
    private String tenHang;

    @Column(name = "DiemToiThieu", nullable = false)
    private Integer diemToiThieu = 0;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String moTa; // Mô tả hạng thành viên

    @Column(name = "MauSac")
    private String mauSac; // Màu sắc hiển thị UI (hex color)

    @Column(name = "TrangThai")
    private Boolean trangThai = true; // Trạng thái kích hoạt

    @Column(name = "Icon")
    private String icon; // Tên icon cho frontend

    @OneToMany(mappedBy = "hangThanhVien", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VipBenefit> vipBenefits = new ArrayList<>();
}