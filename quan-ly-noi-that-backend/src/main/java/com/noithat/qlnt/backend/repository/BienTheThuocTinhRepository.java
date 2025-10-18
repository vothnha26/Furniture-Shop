package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.BienTheThuocTinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BienTheThuocTinhRepository extends JpaRepository<BienTheThuocTinh, Integer> {
    List<BienTheThuocTinh> findByBienTheSanPham_MaBienThe(Integer maBienThe);
    void deleteByBienTheSanPham_MaBienThe(Integer maBienThe);
}
