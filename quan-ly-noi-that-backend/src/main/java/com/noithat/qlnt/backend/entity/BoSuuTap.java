package com.noithat.qlnt.backend.entity;

import java.util.Set;
import java.util.HashSet;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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

    // ----- THÊM PHẦN NÀY VÀO -----
    @ManyToMany(fetch = FetchType.LAZY,
        cascade = {
            CascadeType.PERSIST,
            CascadeType.MERGE
        })
    @JoinTable(name = "BoSuuTap_SanPham", // Tên bảng trung gian
            joinColumns = { @JoinColumn(name = "maBoSuuTap") },
            inverseJoinColumns = { @JoinColumn(name = "maSanPham") })
    // Expose products in collection responses; products are returned as a Set<SanPham>
    @JsonProperty("sanPhams")
    private Set<SanPham> sanPhams = new HashSet<>();
}