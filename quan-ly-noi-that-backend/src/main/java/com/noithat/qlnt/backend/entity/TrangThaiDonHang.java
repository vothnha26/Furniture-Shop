package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TrangThaiDonHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TrangThaiDonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maTrangThai;

    @Column(name = "TenTrangThai", nullable = false)
    private String tenTrangThai;
}
