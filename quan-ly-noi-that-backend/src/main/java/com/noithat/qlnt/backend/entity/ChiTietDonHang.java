package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "ChiTietDonHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChiTietDonHang implements Serializable {

    @EmbeddedId
    private ChiTietDonHangId id = new ChiTietDonHangId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maDonHang")
    private DonHang donHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maBienThe")
    private BienTheSanPham bienThe;

    @Column(name = "SoLuong", nullable = false)
    private Integer soLuong;

    @Column(name = "DonGiaGoc", precision = 18, scale = 2, nullable = false)
    private BigDecimal donGiaGoc;

    @Column(name = "DonGiaThucTe", precision = 18, scale = 2, nullable = false)
    private BigDecimal donGiaThucTe;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class ChiTietDonHangId implements Serializable {
        @Column(name = "MaDonHang")
        private Integer maDonHang;

        @Column(name = "MaBienThe")
        private Integer maBienThe;
    }
}