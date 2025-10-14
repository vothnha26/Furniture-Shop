package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NhaCungCap")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NhaCungCap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maNhaCungCap;

    @Column(name = "TenNhaCungCap", nullable = false)
    private String tenNhaCungCap;
}