package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.HangThanhVien;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HangThanhVienRepository extends JpaRepository<HangThanhVien, Integer> {
    List<HangThanhVien> findAllByOrderByDiemToiThieuAsc();
}