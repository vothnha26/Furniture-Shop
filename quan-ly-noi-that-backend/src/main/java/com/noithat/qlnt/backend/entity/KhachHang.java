package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "KhachHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class KhachHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maKhachHang;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaTaiKhoan", unique = true)
    private TaiKhoan taiKhoan;
    
    @Column(name = "HoTen", nullable = false)
    private String hoTen;

    @Column(name = "Email", nullable = false)
    private String email;

    @Column(name = "SoDienThoai", nullable = false)
    private String soDienThoai;

    @Column(name = "DiaChi")
    private String diaChi;

    @Column(name = "DiemThuong", nullable = false)
    private Integer diemThuong = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaHangThanhVien", nullable = false)
    private HangThanhVien hangThanhVien;
}