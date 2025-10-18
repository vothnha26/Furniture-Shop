package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "Voucher")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maVoucher;

    private String maCode;
    
    private String tenVoucher;
    
    private String moTa;

    @Column(name = "LoaiGiamGia", length = 20)
    private String loaiGiamGia; // 'PERCENTAGE' hoặc 'FIXED'

    @Column(name = "GiaTriGiam", precision = 18, scale = 2)
    private BigDecimal giaTriGiam;
    
    @Column(name = "GiaTriDonHangToiThieu", precision = 18, scale = 2)
    private BigDecimal giaTriDonHangToiThieu = BigDecimal.ZERO;
    
    @Column(name = "GiaTriGiamToiDa", precision = 18, scale = 2)
    private BigDecimal giaTriGiamToiDa;

    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    
    private Integer soLuongToiDa = 1000;
    
    private Integer soLuongDaSuDung = 0;
    
    // Voucher status: one of "CHUA_BAT_DAU", "DANG_HOAT_DONG", "DA_HET_HAN"
    private String trangThai = "DANG_HOAT_DONG";

    private Boolean apDungChoMoiNguoi = true;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VoucherHangThanhVien> hanCheHangThanhVien;
}