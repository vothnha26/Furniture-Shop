package com.noithat.qlnt.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.noithat.qlnt.backend.entity.ChiTietDonHang;
import java.util.List;

public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, ChiTietDonHang.ChiTietDonHangId> {
    List<ChiTietDonHang> findByDonHang_MaDonHang(Integer maDonHang);
}
