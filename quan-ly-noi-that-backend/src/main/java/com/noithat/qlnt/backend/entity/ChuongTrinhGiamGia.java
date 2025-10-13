package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "ChuongTrinhGiamGia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChuongTrinhGiamGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maChuongTrinhGiamGia;

    @Column(name = "TenChuongTrinh", nullable = false)
    private String tenChuongTrinh;

    @Column(name = "MoTa")
    private String moTa;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai")
    private Boolean trangThai = true;

    @Column(name = "LoaiGiamGia")
    private String loaiGiamGia;

    @Column(name = "GiaTriGiam")
    private java.math.BigDecimal giaTriGiam;

    @OneToMany(mappedBy = "chuongTrinhGiamGia", orphanRemoval = true)
    private Set<BienTheGiamGia> bienTheGiamGias;
}


