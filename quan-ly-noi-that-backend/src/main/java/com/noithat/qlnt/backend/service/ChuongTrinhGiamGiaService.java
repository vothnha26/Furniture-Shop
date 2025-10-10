package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.entity.*;
import com.noithat.qlnt.backend.exception.ResourceNotFoundException;
import com.noithat.qlnt.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChuongTrinhGiamGiaService {

    private final ChuongTrinhGiamGiaRepository chuongTrinhGiamGiaRepository;
    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final BienTheGiamGiaRepository bienTheGiamGiaRepository;

    public ChuongTrinhGiamGiaService(ChuongTrinhGiamGiaRepository chuongTrinhGiamGiaRepository,
                                     BienTheSanPhamRepository bienTheSanPhamRepository,
                                     BienTheGiamGiaRepository bienTheGiamGiaRepository) {
        this.chuongTrinhGiamGiaRepository = chuongTrinhGiamGiaRepository;
        this.bienTheSanPhamRepository = bienTheSanPhamRepository;
        this.bienTheGiamGiaRepository = bienTheGiamGiaRepository;
    }

    public List<ChuongTrinhGiamGia> getAll() {
        return chuongTrinhGiamGiaRepository.findAll();
    }

    public ChuongTrinhGiamGia getById(Integer id) {
        return chuongTrinhGiamGiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chương trình ID: " + id + " không tồn tại."));
    }

    @Transactional
    public ChuongTrinhGiamGia create(String ten, LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new IllegalArgumentException("Khoảng thời gian không hợp lệ.");
        }
        ChuongTrinhGiamGia ct = new ChuongTrinhGiamGia();
        ct.setTenChuongTrinh(ten);
        ct.setNgayBatDau(start);
        ct.setNgayKetThuc(end);
        return chuongTrinhGiamGiaRepository.save(ct);
    }

    @Transactional
    public ChuongTrinhGiamGia update(Integer id, String ten, LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new IllegalArgumentException("Khoảng thời gian không hợp lệ.");
        }
        ChuongTrinhGiamGia ct = getById(id);
        ct.setTenChuongTrinh(ten);
        ct.setNgayBatDau(start);
        ct.setNgayKetThuc(end);
        return chuongTrinhGiamGiaRepository.save(ct);
    }

    @Transactional
    public void delete(Integer id) {
        ChuongTrinhGiamGia ct = getById(id);
        chuongTrinhGiamGiaRepository.delete(ct);
    }

    @Transactional
    public void upsertBienTheGia(Integer maChuongTrinh, Integer maBienThe, BigDecimal giaSauGiam) {
        ChuongTrinhGiamGia ct = getById(maChuongTrinh);
        BienTheSanPham bienThe = bienTheSanPhamRepository.findById(maBienThe)
                .orElseThrow(() -> new ResourceNotFoundException("Biến thể ID: " + maBienThe + " không tồn tại."));

        BienTheGiamGia.BienTheGiamGiaId id = new BienTheGiamGia.BienTheGiamGiaId(ct.getMaChuongTrinhGiamGia(), bienThe.getMaBienThe());
        BienTheGiamGia entity = bienTheGiamGiaRepository.findById(id).orElse(new BienTheGiamGia());
        entity.setId(id);
        entity.setChuongTrinhGiamGia(ct);
        entity.setBienTheSanPham(bienThe);
        entity.setGiaSauGiam(giaSauGiam);
        bienTheGiamGiaRepository.save(entity);
    }

    @Transactional
    public void removeBienTheGia(Integer maChuongTrinh, Integer maBienThe) {
        BienTheGiamGia.BienTheGiamGiaId id = new BienTheGiamGia.BienTheGiamGiaId(maChuongTrinh, maBienThe);
        bienTheGiamGiaRepository.deleteById(id);
    }

    public BigDecimal getGiaHienThi(Integer maBienThe) {
        BienTheSanPham bienThe = bienTheSanPhamRepository.findById(maBienThe)
                .orElseThrow(() -> new ResourceNotFoundException("Biến thể ID: " + maBienThe + " không tồn tại."));

        LocalDateTime now = LocalDateTime.now();
        var active = bienTheGiamGiaRepository.findByBienTheSanPham_MaBienThe(maBienThe).stream()
                .filter(x -> x.getChuongTrinhGiamGia().getNgayBatDau().isBefore(now)
                        && x.getChuongTrinhGiamGia().getNgayKetThuc().isAfter(now))
                .collect(Collectors.toList());

        if (active.isEmpty()) {
            return bienThe.getGiaBan();
        }

        BigDecimal min = active.stream().map(BienTheGiamGia::getGiaSauGiam)
                .min(BigDecimal::compareTo)
                .orElse(bienThe.getGiaBan());
        return min.min(bienThe.getGiaBan());
    }
}


