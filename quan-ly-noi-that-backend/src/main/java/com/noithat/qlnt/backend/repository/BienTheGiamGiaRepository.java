package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.BienTheGiamGia;
import com.noithat.qlnt.backend.entity.BienTheGiamGia.BienTheGiamGiaId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BienTheGiamGiaRepository extends JpaRepository<BienTheGiamGia, BienTheGiamGiaId> {
    List<BienTheGiamGia> findByChuongTrinhGiamGia_MaChuongTrinhGiamGia(Integer maChuongTrinh);
    List<BienTheGiamGia> findByBienTheSanPham_MaBienThe(Integer maBienThe);
}


