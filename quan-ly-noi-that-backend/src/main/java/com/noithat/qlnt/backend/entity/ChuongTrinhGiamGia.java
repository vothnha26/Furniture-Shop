package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "ChuongTrinhGiamGia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChuongTrinhGiamGia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maChuongTrinhGiamGia;

    @Column(name = "TenChuongTrinh", nullable = false)
    private String tenChuongTrinh;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @OneToMany(mappedBy = "chuongTrinhGiamGia", orphanRemoval = true)
    private Set<BienTheGiamGia> bienTheGiamGias;
}


