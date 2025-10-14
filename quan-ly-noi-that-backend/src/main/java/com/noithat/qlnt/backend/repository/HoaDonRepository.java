package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.DonHang;
import com.noithat.qlnt.backend.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {
    Optional<HoaDon> findByDonHang(DonHang donHang);
}
