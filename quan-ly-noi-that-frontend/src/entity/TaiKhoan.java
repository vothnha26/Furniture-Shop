package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TaiKhoan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maTaiKhoan;

    @Column(name = "TenDangNhap", nullable = false, unique = true)
    private String tenDangNhap;

    @Column(name = "MatKhauHash", nullable = false)
    private String matKhauHash;

    @Column(name = "Email", nullable = false, unique = true)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaVaiTro", nullable = false)
    private VaiTro vaiTro;
}