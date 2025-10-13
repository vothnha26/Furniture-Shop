package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.DonHangDichVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonHangDichVuRepository extends JpaRepository<DonHangDichVu, DonHangDichVu.DonHangDichVuId> {
}
