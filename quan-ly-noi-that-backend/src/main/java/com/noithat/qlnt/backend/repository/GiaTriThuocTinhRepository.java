package com.noithat.qlnt.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.noithat.qlnt.backend.entity.GiaTriThuocTinh;

@Repository
public interface GiaTriThuocTinhRepository extends JpaRepository<GiaTriThuocTinh, Integer> {
    List<GiaTriThuocTinh> findByThuocTinh_MaThuocTinh(Integer maThuocTinh);
}