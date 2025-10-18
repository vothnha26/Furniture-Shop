package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.ThongTinGiaoHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ThongTinGiaoHangRepository extends JpaRepository<ThongTinGiaoHang, Integer> {
	Optional<ThongTinGiaoHang> findByMaVanDon(String maVanDon);
}
