package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.LichSuDiemThuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LichSuDiemThuongRepository extends JpaRepository<LichSuDiemThuong, Integer> {
}
