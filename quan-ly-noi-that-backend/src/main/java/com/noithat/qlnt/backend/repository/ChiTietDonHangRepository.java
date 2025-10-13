package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.ChiTietDonHang;
import com.noithat.qlnt.backend.entity.ChiTietDonHang.ChiTietDonHangId;
import com.noithat.qlnt.backend.entity.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, ChiTietDonHangId> {
    
    // Tìm chi tiết theo đơn hàng
    @Query("SELECT c FROM ChiTietDonHang c WHERE c.donHang = :donHang")
    List<ChiTietDonHang> findByDonHang(@Param("donHang") DonHang donHang);
    
    // Tìm chi tiết theo mã đơn hàng
    @Query("SELECT c FROM ChiTietDonHang c WHERE c.donHang.maDonHang = :maDonHang")
    List<ChiTietDonHang> findByDonHangId(@Param("maDonHang") Integer maDonHang);
    
    // Tìm theo biến thể sản phẩm
    @Query("SELECT c FROM ChiTietDonHang c WHERE c.bienThe.maBienThe = :maBienThe")
    List<ChiTietDonHang> findByBienTheSanPham(@Param("maBienThe") Integer maBienThe);
    
    // Tìm chi tiết cụ thể theo composite key
    @Query("SELECT c FROM ChiTietDonHang c WHERE c.id.maDonHang = :maDonHang AND c.id.maBienThe = :maBienThe")
    ChiTietDonHang findByMaDonHangAndMaBienThe(@Param("maDonHang") Integer maDonHang, 
                                               @Param("maBienThe") Integer maBienThe);
    
    // Kiểm tra tồn tại chi tiết đơn hàng
    @Query("SELECT COUNT(c) > 0 FROM ChiTietDonHang c WHERE c.id.maDonHang = :maDonHang AND c.id.maBienThe = :maBienThe")
    boolean existsByMaDonHangAndMaBienThe(@Param("maDonHang") Integer maDonHang, 
                                          @Param("maBienThe") Integer maBienThe);
}