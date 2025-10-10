package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "Voucher")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maVoucher;

    private String maCode;

    @Column(name = "LoaiGiamGia", length = 20)
    private String loaiGiamGia; // 'PERCENT' hoặc 'FIXED'

    @Column(name = "GiaTriGiam", precision = 18, scale = 2)
    private BigDecimal giaTriGiam;

    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;

    private Boolean apDungChoMoiNguoi = true;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VoucherHangThanhVien> hanCheHangThanhVien;
}