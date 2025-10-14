package com.noithat.qlnt.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "BoSuuTap") 
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BoSuuTap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maBoSuuTap;

    @Column(name = "TenBoSuuTap", nullable = false)
    private String tenBoSuuTap;

    @Column(name = "MoTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;
}