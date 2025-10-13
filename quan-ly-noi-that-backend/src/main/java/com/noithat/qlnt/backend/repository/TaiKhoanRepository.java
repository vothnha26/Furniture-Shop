package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
}