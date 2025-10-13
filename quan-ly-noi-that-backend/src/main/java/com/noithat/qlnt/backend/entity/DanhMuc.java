package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DanhMuc")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DanhMuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maDanhMuc;

    @Column(name = "TenDanhMuc", nullable = false, unique = true)
    private String tenDanhMuc;
}