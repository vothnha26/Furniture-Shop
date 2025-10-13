package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.BienTheSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BienTheSanPhamRepository extends JpaRepository<BienTheSanPham, Integer> {
    
    // Tìm theo SKU
    Optional<BienTheSanPham> findBySku(String sku);
    
    // Tìm tất cả biến thể của một sản phẩm
    @Query("SELECT b FROM BienTheSanPham b WHERE b.sanPham.maSanPham = :maSanPham")
    List<BienTheSanPham> findBySanPhamId(@Param("maSanPham") Integer maSanPham);
    
    // =================== INVENTORY MANAGEMENT QUERIES ===================
    
    // Tìm sản phẩm sắp hết hàng
    @Query("SELECT b FROM BienTheSanPham b WHERE b.soLuongTon <= b.mucTonToiThieu AND b.trangThaiKho = 'ACTIVE'")
    List<BienTheSanPham> findLowStockProducts();
    
    // Tìm sản phẩm hết hàng
    @Query("SELECT b FROM BienTheSanPham b WHERE b.soLuongTon <= 0 AND b.trangThaiKho = 'ACTIVE'")
    List<BienTheSanPham> findOutOfStockProducts();
    
    // Tìm sản phẩm theo trạng thái kho
    @Query("SELECT b FROM BienTheSanPham b WHERE b.trangThaiKho = :trangThai")
    List<BienTheSanPham> findByTrangThaiKho(@Param("trangThai") String trangThai);
    
    // Tìm sản phẩm theo vị trí kho
    @Query("SELECT b FROM BienTheSanPham b WHERE b.viTriKho = :viTri")
    List<BienTheSanPham> findByViTriKho(@Param("viTri") String viTri);
    
    // Tìm sản phẩm có số lượng tồn trong khoảng
    @Query("SELECT b FROM BienTheSanPham b WHERE b.soLuongTon BETWEEN :min AND :max")
    List<BienTheSanPham> findByStockRange(@Param("min") Integer min, @Param("max") Integer max);
    
    // Tìm sản phẩm có số lượng đặt trước > 0
    @Query("SELECT b FROM BienTheSanPham b WHERE b.soLuongDatTruoc > 0")
    List<BienTheSanPham> findProductsWithPreorders();
    
    // =================== STOCK UPDATE QUERIES ===================
    
    // Cập nhật số lượng tồn kho
    @Modifying
    @Transactional
    @Query("UPDATE BienTheSanPham b SET b.soLuongTon = b.soLuongTon + :quantity, " +
           "b.ngayCapNhatKho = :updateTime WHERE b.maBienThe = :maBienThe")
    int updateStock(@Param("maBienThe") Integer maBienThe, 
                    @Param("quantity") Integer quantity, 
                    @Param("updateTime") LocalDateTime updateTime);
    
    // Đặt trước hàng
    @Modifying
    @Transactional
    @Query("UPDATE BienTheSanPham b SET b.soLuongDatTruoc = b.soLuongDatTruoc + :quantity " +
           "WHERE b.maBienThe = :maBienThe AND b.soLuongTon >= :quantity")
    int reserveStock(@Param("maBienThe") Integer maBienThe, 
                     @Param("quantity") Integer quantity);
    
    // Hủy đặt trước
    @Modifying
    @Transactional
    @Query("UPDATE BienTheSanPham b SET b.soLuongDatTruoc = b.soLuongDatTruoc - :quantity " +
           "WHERE b.maBienThe = :maBienThe AND b.soLuongDatTruoc >= :quantity")
    int releaseReservation(@Param("maBienThe") Integer maBienThe, 
                           @Param("quantity") Integer quantity);
    
    // Xác nhận bán hàng (trừ tồn kho và đặt trước)
    @Modifying
    @Transactional
    @Query("UPDATE BienTheSanPham b SET b.soLuongTon = b.soLuongTon - :quantity, " +
           "b.soLuongDatTruoc = b.soLuongDatTruoc - :quantity, " +
           "b.ngayCapNhatKho = :updateTime " +
           "WHERE b.maBienThe = :maBienThe AND b.soLuongTon >= :quantity AND b.soLuongDatTruoc >= :quantity")
    int confirmSale(@Param("maBienThe") Integer maBienThe, 
                    @Param("quantity") Integer quantity, 
                    @Param("updateTime") LocalDateTime updateTime);
    
    // Cập nhật trạng thái kho
    @Modifying
    @Transactional
    @Query("UPDATE BienTheSanPham b SET b.trangThaiKho = :trangThai, " +
           "b.ngayCapNhatKho = :updateTime WHERE b.maBienThe = :maBienThe")
    int updateStockStatus(@Param("maBienThe") Integer maBienThe, 
                         @Param("trangThai") String trangThai, 
                         @Param("updateTime") LocalDateTime updateTime);
    
    // =================== REPORTING QUERIES ===================
    
    // Thống kê tồn kho theo sản phẩm
    @Query("SELECT b.sanPham.tenSanPham, SUM(b.soLuongTon), SUM(b.soLuongDatTruoc) " +
           "FROM BienTheSanPham b GROUP BY b.sanPham.maSanPham, b.sanPham.tenSanPham")
    List<Object[]> getStockSummaryByProduct();
    
    // Thống kê tồn kho theo danh mục
    @Query("SELECT dm.tenDanhMuc, SUM(b.soLuongTon), COUNT(b) " +
           "FROM BienTheSanPham b JOIN b.sanPham sp JOIN sp.danhMuc dm " +
           "GROUP BY dm.maDanhMuc, dm.tenDanhMuc")
    List<Object[]> getStockSummaryByCategory();
    
    // Tính tổng giá trị tồn kho
    @Query("SELECT SUM(b.soLuongTon * b.giaBan) FROM BienTheSanPham b WHERE b.trangThaiKho = 'ACTIVE'")
    Double getTotalStockValue();
    
    // Sản phẩm bán chạy (dự đoán từ số lượng đặt trước)
    @Query("SELECT b FROM BienTheSanPham b WHERE b.soLuongDatTruoc > 0 ORDER BY b.soLuongDatTruoc DESC")
    List<BienTheSanPham> getPopularProducts();
    
    // Kiểm tra khả năng bán
    @Query("SELECT CASE WHEN (b.soLuongTon - b.soLuongDatTruoc) >= :quantity THEN true ELSE false END " +
           "FROM BienTheSanPham b WHERE b.maBienThe = :maBienThe")
    Boolean isAvailableForSale(@Param("maBienThe") Integer maBienThe, 
                               @Param("quantity") Integer quantity);
    
    // Lấy số lượng có thể bán
    @Query("SELECT (b.soLuongTon - b.soLuongDatTruoc) FROM BienTheSanPham b WHERE b.maBienThe = :maBienThe")
    Integer getAvailableQuantity(@Param("maBienThe") Integer maBienThe);
}


