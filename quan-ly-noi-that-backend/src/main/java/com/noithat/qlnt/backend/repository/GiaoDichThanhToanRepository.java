package com.noithat.qlnt.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.noithat.qlnt.backend.entity.GiaoDichThanhToan;
import java.util.List;

public interface GiaoDichThanhToanRepository extends JpaRepository<GiaoDichThanhToan, Integer> {
    List<GiaoDichThanhToan> findByDonHang_MaDonHang(Integer maDonHang);
}
