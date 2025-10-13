package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.HangThanhVien;
import org.springframework.data.jpa.repository.JpaRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface HangThanhVienRepository extends JpaRepository<HangThanhVien, Integer> {
    
    List<HangThanhVien> findAllByOrderByDiemToiThieuAsc();
    
    List<HangThanhVien> findAllByOrderByDiemToiThieuDesc();
    
    Optional<HangThanhVien> findFirstByOrderByDiemToiThieuAsc();
    
    boolean existsByTenHang(String tenHang);
    
    boolean existsByDiemToiThieu(Integer diemToiThieu);
    
    Optional<HangThanhVien> findByTenHang(String tenHang);
    
    // VIP Management methods
    List<HangThanhVien> findAllByTrangThaiTrueOrderByThuTuAsc();
    
    Optional<HangThanhVien> findFirstByTrangThaiTrueOrderByThuTuAsc();
    
    Optional<HangThanhVien> findTopBySoTienToiThieuLessThanEqualAndTrangThaiTrueOrderBySoTienToiThieuDesc(BigDecimal soTien);
    
    List<HangThanhVien> findAllByTrangThaiOrderByThuTuAsc(Boolean trangThai);
}