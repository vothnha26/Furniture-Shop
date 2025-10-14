package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.KiemKeChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface KiemKeChiTietRepository extends JpaRepository<KiemKeChiTiet, Integer> {
    
    // Tìm chi tiết kiểm kê theo phiếu kiểm kê
    @Query("SELECT kc FROM KiemKeChiTiet kc WHERE kc.kiemKeKho.maKiemKe = :maKiemKe ORDER BY kc.bienTheSanPham.sku")
    List<KiemKeChiTiet> findByKiemKeKhoOrderBySku(@Param("maKiemKe") Integer maKiemKe);
    
    // Tìm chi tiết kiểm kê theo trạng thái
    @Query("SELECT kc FROM KiemKeChiTiet kc WHERE kc.kiemKeKho.maKiemKe = :maKiemKe AND kc.trangThai = :trangThai")
    List<KiemKeChiTiet> findByKiemKeKhoAndTrangThai(@Param("maKiemKe") Integer maKiemKe, 
                                                   @Param("trangThai") KiemKeChiTiet.TrangThaiKiemKeChiTiet trangThai);
    
    // Tìm sản phẩm có chênh lệch
    @Query("SELECT kc FROM KiemKeChiTiet kc WHERE kc.kiemKeKho.maKiemKe = :maKiemKe AND kc.chenhLech != 0")
    List<KiemKeChiTiet> findWithDifferencesByKiemKeKho(@Param("maKiemKe") Integer maKiemKe);
    
    // Tìm sản phẩm thiếu hàng
    @Query("SELECT kc FROM KiemKeChiTiet kc WHERE kc.kiemKeKho.maKiemKe = :maKiemKe AND kc.chenhLech < 0")
    List<KiemKeChiTiet> findShortagesByKiemKeKho(@Param("maKiemKe") Integer maKiemKe);
    
    // Tìm sản phẩm thừa hàng
    @Query("SELECT kc FROM KiemKeChiTiet kc WHERE kc.kiemKeKho.maKiemKe = :maKiemKe AND kc.chenhLech > 0")
    List<KiemKeChiTiet> findSurplusByKiemKeKho(@Param("maKiemKe") Integer maKiemKe);
    
    // Thống kê chênh lệch theo phiếu kiểm kê
    @Query("SELECT " +
           "COUNT(kc), " +
           "SUM(CASE WHEN kc.chenhLech = 0 THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN kc.chenhLech > 0 THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN kc.chenhLech < 0 THEN 1 ELSE 0 END), " +
           "SUM(ABS(kc.chenhLech)), " +
           "SUM(ABS(kc.giaTriChenhLech)) " +
           "FROM KiemKeChiTiet kc WHERE kc.kiemKeKho.maKiemKe = :maKiemKe")
    Object[] getInventoryCheckSummary(@Param("maKiemKe") Integer maKiemKe);
    
    // Tính tổng giá trị chênh lệch
    @Query("SELECT SUM(kc.giaTriChenhLech) FROM KiemKeChiTiet kc WHERE kc.kiemKeKho.maKiemKe = :maKiemKe")
    BigDecimal getTotalDifferenceValue(@Param("maKiemKe") Integer maKiemKe);
    
    // Kiểm tra tồn tại chi tiết kiểm kê cho biến thể
    @Query("SELECT COUNT(kc) > 0 FROM KiemKeChiTiet kc WHERE kc.kiemKeKho.maKiemKe = :maKiemKe AND kc.bienTheSanPham.maBienThe = :maBienThe")
    Boolean existsByKiemKeKhoAndBienTheSanPham(@Param("maKiemKe") Integer maKiemKe, 
                                              @Param("maBienThe") Integer maBienThe);
}