package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VaiTroRepository extends JpaRepository<VaiTro, Integer> {
}