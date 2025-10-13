package com.noithat.qlnt.backend.entity;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
@Table(name = "DanhMuc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DanhMuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maDanhMuc;

    @Column(name = "TenDanhMuc", nullable = false, unique = true)
    private String tenDanhMuc;

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "DanhMuc_LienKet", // Tên bảng trung gian
            joinColumns = @JoinColumn(name = "MaDanhMucCon"), // Khóa ngoại trỏ đến ID của lớp này (con)
            inverseJoinColumns = @JoinColumn(name = "MaDanhMucCha") // Khóa ngoại trỏ đến ID của lớp kia (cha)
    )
    @JsonIgnoreProperties("children") // Tránh lặp vô hạn khi serialize
    private Set<DanhMuc> parents = new HashSet<>();

    @ManyToMany(mappedBy = "parents", fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JsonIgnoreProperties("parents") // Tránh lặp vô hạn khi serialize
    private Set<DanhMuc> children = new HashSet<>();

    // Override equals and hashCode để Set hoạt động chính xác
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DanhMuc danhMuc = (DanhMuc) o;
        return maDanhMuc != null && maDanhMuc.equals(danhMuc.maDanhMuc);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}