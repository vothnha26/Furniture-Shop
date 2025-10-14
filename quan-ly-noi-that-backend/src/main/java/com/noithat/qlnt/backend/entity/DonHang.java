package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "DonHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maDonHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaKhachHang", nullable = false)
    private KhachHang khachHang;

    @Column(name = "NgayDatHang", nullable = false)
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

    @Column(name = "PhuongThucThanhToan", nullable = false)
    private String phuongThucThanhToan;

    @Column(name = "PhuongThucGiaoHang", nullable = false)
    private String phuongThucGiaoHang;

    @Column(length = 255)
    private String ghiChu;

    @Column(name = "TenNguoiNhan", length = 100)
    private String tenNguoiNhan;

    @Column(name = "SoDienThoaiNhan", length = 20)
    private String soDienThoaiNhan;

    @Column(name = "DiaChiGiaoHang", length = 255)
    private String diaChiGiaoHang;

    @Column(name = "DiemSuDung")
    private Integer diemSuDung;

    @Column(name = "GiaTriDiem", precision = 18, scale = 2)
    private BigDecimal giaTriDiem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNhanVienDuyet")
    private NhanVien nhanVienDuyet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaVoucher")
    private Voucher voucher;

    @OneToMany(mappedBy = "donHang",
            cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REMOVE},
            orphanRemoval = true)
    private List<ChiTietDonHang> chiTietDonHangs = new ArrayList<>();
}
