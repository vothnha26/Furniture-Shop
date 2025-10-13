package com.noithat.qlnt.backend.entity;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.stream.Collectors;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table(name = "SanPham")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maSanPham;

    @Column(name = "TenSanPham", nullable = false)
    private String tenSanPham;

    @Column(name = "MoTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "ChieuDai")
    private Integer chieuDai;

    @Column(name = "ChieuRong")
    private Integer chieuRong;

    @Column(name = "ChieuCao")
    private Integer chieuCao;

    @Column(name = "CanNang")
    private Integer canNang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDanhMuc")
    private DanhMuc danhMuc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNhaCungCap")
    private NhaCungCap nhaCungCap;

    @ManyToMany(mappedBy = "sanPhams", fetch = FetchType.LAZY)
    @JsonIgnore // Tránh lỗi lặp vô hạn
    private Set<BoSuuTap> boSuuTaps;
    
    // Trả về mã các bộ sưu tập liên kết để client dễ truy vấn
    @JsonProperty("maBoSuuTapList")
    public Set<Integer> getMaBoSuuTapList() {
        if (this.boSuuTaps == null) return java.util.Set.of();
        return this.boSuuTaps.stream()
                .map(BoSuuTap::getMaBoSuuTap)
                .collect(Collectors.toSet());
    }
    
}