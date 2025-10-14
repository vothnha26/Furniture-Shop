package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuDiemThuong")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LichSuDiemThuong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maGiaoDich;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKhachHang", nullable = false)
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDonHang")
    private DonHang donHang;

    @Column(name = "DiemThayDoi", nullable = false)
    private Integer diemThayDoi;

    @Column(name = "LyDo")
    private String lyDo;

    @Column(name = "NgayGhiNhan")
    private LocalDateTime ngayGhiNhan = LocalDateTime.now();
}