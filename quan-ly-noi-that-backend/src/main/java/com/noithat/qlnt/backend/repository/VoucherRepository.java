package com.noithat.qlnt.backend.repository;

import com.noithat.qlnt.backend.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    Optional<Voucher> findByMaCode(String maCode);
}