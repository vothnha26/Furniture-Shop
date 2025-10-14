package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "GiaTriThuocTinh")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GiaTriThuocTinh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maGiaTri;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaThuocTinh", nullable = false)
    private ThuocTinh thuocTinh;

    @Column(name = "GiaTri", nullable = false)
    private String giaTri;
}