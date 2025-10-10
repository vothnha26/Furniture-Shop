package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

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
}