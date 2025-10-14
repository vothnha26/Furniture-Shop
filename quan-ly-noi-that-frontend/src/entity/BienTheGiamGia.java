package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "BienTheGiamGia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BienTheGiamGia {

    @EmbeddedId
    private BienTheGiamGiaId id = new BienTheGiamGiaId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maChuongTrinhGiamGia")
    private ChuongTrinhGiamGia chuongTrinhGiamGia;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maBienThe")
    private BienTheSanPham bienTheSanPham;

    @Column(name = "GiaSauGiam", precision = 18, scale = 2, nullable = false)
    private BigDecimal giaSauGiam;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class BienTheGiamGiaId implements java.io.Serializable {
        @Column(name = "MaChuongTrinhGiamGia")
        private Integer maChuongTrinhGiamGia;

        @Column(name = "MaBienThe")
        private Integer maBienThe;
    }
}


