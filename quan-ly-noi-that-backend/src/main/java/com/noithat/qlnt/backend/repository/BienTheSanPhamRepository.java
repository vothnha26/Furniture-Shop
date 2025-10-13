package com.noithat.qlnt.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.noithat.qlnt.backend.entity.BienTheSanPham;
public interface BienTheSanPhamRepository extends JpaRepository<BienTheSanPham, Integer> {
    List<BienTheSanPham> findBySanPham_MaSanPham(Integer maSanPham);
}


