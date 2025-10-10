package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "DonHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maDonHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKhachHang", nullable = false)
    private KhachHang khachHang;

    @Column(name = "NgayDatHang")
    private LocalDateTime ngayDatHang = LocalDateTime.now();

    @Column(name = "TongTienGoc", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongTienGoc;

    @Column(name = "GiamGiaVoucher", precision = 18, scale = 2)
    private BigDecimal giamGiaVoucher = BigDecimal.ZERO;

    @Column(name = "ChiPhiDichVu", precision = 18, scale = 2)
    private BigDecimal chiPhiDichVu = BigDecimal.ZERO;

    @Column(name = "ThanhTien", precision = 18, scale = 2, nullable = false)
    private BigDecimal thanhTien;

    @Column(name = "TrangThai", nullable = false)
    private String trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNhanVienDuyet")
    private NhanVien nhanVienDuyet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaVoucher")
    private Voucher voucher;
}