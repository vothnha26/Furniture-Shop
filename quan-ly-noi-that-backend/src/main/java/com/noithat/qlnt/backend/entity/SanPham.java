package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SanPham")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maSanPham;

    @Column(name = "TenSanPham", nullable = false)
    private String tenSanPham;

    @Column(name = "MoTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "ChieuDai")
    private Integer chieuDai;

    @Column(name = "ChieuRong")
    private Integer chieuRong;

    @Column(name = "ChieuCao")
    private Integer chieuCao;

    @Column(name = "CanNang")
    private Integer canNang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDanhMuc")
    private DanhMuc danhMuc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNhaCungCap")
    private NhaCungCap nhaCungCap;

    // Quan hệ ManyToOne: Nhiều sản phẩm thuộc một bộ sưu tập (1-N)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaBoSuuTap")
    private BoSuuTap boSuuTap;
}