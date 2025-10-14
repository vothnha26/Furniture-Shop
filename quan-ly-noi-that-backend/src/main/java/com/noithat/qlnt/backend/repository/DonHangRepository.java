package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Integer> {
    
    // =================== STATISTICS QUERIES (Từ HEAD - Native SQL cho báo cáo) ===================
    
    @Query(value = "SELECT COUNT(*) FROM DonHang", nativeQuery = true)
    long countTongDonHang();

    @Query(value = "SELECT COUNT(*) FROM DonHang WHERE TrangThai = N'Chờ xử lý'", nativeQuery = true)
    long countChoXuLy();

    @Query(value = "SELECT COUNT(*) FROM DonHang WHERE TrangThai = N'Hoàn thành'", nativeQuery = true)
    long countHoanThanh();

    @Query(value = """
        SELECT COALESCE(SUM(ThanhTien), 0)
        FROM DonHang
        WHERE CAST(NgayDatHang AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    BigDecimal sumDoanhThuHomNay();
    
    // =================== ORDER MANAGEMENT QUERIES (Từ nhánh Phuc - JPQL) ===================
    
    // Tìm theo trạng thái
    @Query("SELECT d FROM DonHang d WHERE d.trangThai = :trangThai ORDER BY d.ngayDatHang DESC")
    List<DonHang> findByTrangThai(@Param("trangThai") String trangThai);
    
    // Tìm theo nhiều trạng thái
    @Query("SELECT d FROM DonHang d WHERE d.trangThai IN :trangThaiList ORDER BY d.ngayDatHang DESC")
    List<DonHang> findByTrangThaiIn(@Param("trangThaiList") List<String> trangThaiList);
    
    // Tìm theo khách hàng
    @Query("SELECT d FROM DonHang d WHERE d.khachHang.maKhachHang = :maKhachHang ORDER BY d.ngayDatHang DESC")
    List<DonHang> findByKhachHang(@Param("maKhachHang") Integer maKhachHang);
    
    // Tìm theo khoảng thời gian
    @Query("SELECT d FROM DonHang d WHERE d.ngayDatHang BETWEEN :fromDate AND :toDate ORDER BY d.ngayDatHang DESC")
    List<DonHang> findByNgayDatHangBetween(@Param("fromDate") LocalDateTime fromDate, 
                                          @Param("toDate") LocalDateTime toDate);
    
    // Tìm theo nhân viên duyệt
    @Query("SELECT d FROM DonHang d WHERE d.nhanVienDuyet.maNhanVien = :maNhanVien ORDER BY d.ngayDatHang DESC")
    List<DonHang> findByNhanVienDuyet(@Param("maNhanVien") Integer maNhanVien);
    
    // Tìm đơn hàng cần chú ý (quá hạn xử lý hoặc có vấn đề)
    @Query("SELECT d FROM DonHang d WHERE " +
           "(d.trangThai = 'XAC_NHAN' AND DATEDIFF(day, d.ngayDatHang, CURRENT_TIMESTAMP) >= 1) OR " +
           "(d.trangThai = 'DANG_CHUAN_BI' AND DATEDIFF(day, d.ngayDatHang, CURRENT_TIMESTAMP) >= 2) OR " +
           "(d.trangThai = 'DANG_GIAO' AND DATEDIFF(day, d.ngayDatHang, CURRENT_TIMESTAMP) >= 3) " +
           "ORDER BY d.ngayDatHang ASC")
    List<DonHang> findOrdersNeedingAttention();
    
    // Đếm số đơn hàng của khách hàng
    long countByKhachHang_MaKhachHang(Integer maKhachHang);
}
