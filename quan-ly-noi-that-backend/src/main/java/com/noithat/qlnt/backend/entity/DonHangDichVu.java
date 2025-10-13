package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "DonHang_DichVu")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DonHangDichVu implements Serializable {

    @EmbeddedId
    private DonHangDichVuId id = new DonHangDichVuId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maDonHang")
    private DonHang donHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maDichVu")
    private DichVu dichVu;

    @Column(name = "SoLuong")
    private Integer soLuong = 1;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class DonHangDichVuId implements Serializable {
        @Column(name = "MaDonHang")
        private Integer maDonHang;

        @Column(name = "MaDichVu")
        private Integer maDichVu;
    }
}