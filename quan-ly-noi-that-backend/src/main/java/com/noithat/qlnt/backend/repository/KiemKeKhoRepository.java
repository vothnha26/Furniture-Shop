package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.KiemKeKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface KiemKeKhoRepository extends JpaRepository<KiemKeKho, Integer> {
    
    // Tìm kiểm kê theo trạng thái
    @Query("SELECT k FROM KiemKeKho k WHERE k.trangThai = :trangThai ORDER BY k.ngayTao DESC")
    List<KiemKeKho> findByTrangThaiOrderByNgayTaoDesc(@Param("trangThai") KiemKeKho.TrangThaiKiemKe trangThai);
    
    // Tìm kiểm kê theo người tạo
    @Query("SELECT k FROM KiemKeKho k WHERE k.nguoiTao = :nguoiTao ORDER BY k.ngayTao DESC")
    List<KiemKeKho> findByNguoiTaoOrderByNgayTaoDesc(@Param("nguoiTao") String nguoiTao);
    
    // Tìm kiểm kê trong khoảng thời gian
    @Query("SELECT k FROM KiemKeKho k WHERE k.ngayTao BETWEEN :fromDate AND :toDate ORDER BY k.ngayTao DESC")
    List<KiemKeKho> findByNgayTaoBetweenOrderByNgayTaoDesc(@Param("fromDate") LocalDateTime fromDate, 
                                                          @Param("toDate") LocalDateTime toDate);
    
    // Tìm kiểm kê đang thực hiện
    @Query("SELECT k FROM KiemKeKho k WHERE k.trangThai IN ('DANG_CHUAN_BI', 'DANG_KIEM_KE') ORDER BY k.ngayTao DESC")
    List<KiemKeKho> findActiveInventoryChecks();
    
    // Thống kê kiểm kê theo trạng thái
    @Query("SELECT k.trangThai, COUNT(k) FROM KiemKeKho k GROUP BY k.trangThai")
    List<Object[]> getInventoryCheckStatsByStatus();
}