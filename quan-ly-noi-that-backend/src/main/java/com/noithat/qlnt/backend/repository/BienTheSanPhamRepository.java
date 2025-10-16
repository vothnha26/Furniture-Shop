package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.BienTheSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BienTheSanPhamRepository extends JpaRepository<BienTheSanPham, Integer> {
    List<BienTheSanPham> findBySanPham_MaSanPham(Integer maSanPham);

    boolean existsBySku(String sku);

    Optional<BienTheSanPham> findBySku(String sku);

    // ================= Custom queries used by inventory service =================
    @Query("SELECT b FROM BienTheSanPham b WHERE b.soLuongTon <= b.mucTonToiThieu")
    java.util.List<BienTheSanPham> findLowStockProducts();

    @Query("SELECT b FROM BienTheSanPham b WHERE b.soLuongTon <= 0")
    java.util.List<BienTheSanPham> findOutOfStockProducts();

    @Query("SELECT CASE WHEN b.soLuongTon >= :quantity THEN true ELSE false END FROM BienTheSanPham b WHERE b.maBienThe = :id")
    Boolean isAvailableForSale(@Param("id") Integer maBienThe, @Param("quantity") Integer quantity);

    @Query("SELECT b.soLuongTon FROM BienTheSanPham b WHERE b.maBienThe = :id")
    Integer getAvailableQuantity(@Param("id") Integer maBienThe);

    @Query("SELECT SUM(b.giaBan * b.soLuongTon) FROM BienTheSanPham b")
    Double getTotalStockValue();

    @Query("SELECT b.sanPham.maSanPham, b.sanPham.tenSanPham, SUM(b.soLuongTon) FROM BienTheSanPham b GROUP BY b.sanPham.maSanPham, b.sanPham.tenSanPham")
    java.util.List<Object[]> getStockSummaryByProduct();

    @Query("SELECT b.sanPham.danhMuc.maDanhMuc, b.sanPham.danhMuc.tenDanhMuc, SUM(b.soLuongTon) FROM BienTheSanPham b GROUP BY b.sanPham.danhMuc.maDanhMuc, b.sanPham.danhMuc.tenDanhMuc")
    java.util.List<Object[]> getStockSummaryByCategory();

    // Find by stock status (used by inventory checks)
    java.util.List<BienTheSanPham> findByTrangThaiKho(String trangThai);
}
