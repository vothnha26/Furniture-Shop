package com.noithat.qlnt.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.noithat.qlnt.backend.entity.BienTheGiaTriThuocTinh;

@Repository
public interface BienTheGiaTriThuocTinhRepository extends JpaRepository<BienTheGiaTriThuocTinh, BienTheGiaTriThuocTinh.BienTheGiaTriThuocTinhId> {
    // Repository này quản lý bảng nối giữa Biến thể và Giá trị thuộc tính
    
    List<BienTheGiaTriThuocTinh> findByBienTheSanPham_MaBienThe(Integer maBienThe);
    
    void deleteByBienTheSanPham_MaBienThe(Integer maBienThe);
}