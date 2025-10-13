package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.DonHang;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Integer> {

    @Query(value = "SELECT COUNT(*) FROM DonHang", nativeQuery = true)
    long countTongDonHang();

    @Query(value = "SELECT COUNT(*) FROM DonHang WHERE TrangThai = N'Chờ xử lý'", nativeQuery = true)
    long countChoXuLy();

    @Query(value = "SELECT COUNT(*) FROM DonHang WHERE TrangThai = N'Hoàn thành'", nativeQuery = true)
    long countHoanThanh();

    @Query(value = """
        SELECT COALESCE(SUM(TongTien), 0)
        FROM DonHang
        WHERE CAST(NgayTao AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    BigDecimal sumDoanhThuHomNay();
}
