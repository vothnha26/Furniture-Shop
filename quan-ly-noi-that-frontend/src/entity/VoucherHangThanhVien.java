package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "Voucher_HangThanhVien")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class VoucherHangThanhVien implements Serializable {

    @EmbeddedId
    private VoucherHangThanhVienId id = new VoucherHangThanhVienId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maVoucher")
    private Voucher voucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maHangThanhVien")
    private HangThanhVien hangThanhVien;

    // Lớp cho Khóa chính phức hợp
    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class VoucherHangThanhVienId implements Serializable {
        @Column(name = "MaVoucher")
        private Integer maVoucher;

        @Column(name = "MaHangThanhVien")
        private Integer maHangThanhVien;
    }
}