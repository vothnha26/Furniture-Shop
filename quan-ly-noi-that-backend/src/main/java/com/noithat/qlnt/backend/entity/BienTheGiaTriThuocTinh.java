package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "BienThe_GiaTriThuocTinh")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BienTheGiaTriThuocTinh implements Serializable {

    @EmbeddedId
    private BienTheGiaTriThuocTinhId id = new BienTheGiaTriThuocTinhId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maBienThe")
    private BienTheSanPham bienTheSanPham;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maGiaTri")
    private GiaTriThuocTinh giaTriThuocTinh;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class BienTheGiaTriThuocTinhId implements Serializable {
        @Column(name = "MaBienThe")
        private Integer maBienThe;

        @Column(name = "MaGiaTri")
        private Integer maGiaTri;
    }
}