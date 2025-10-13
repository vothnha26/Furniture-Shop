package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.BienTheGiamGiaRequest;
import com.noithat.qlnt.backend.dto.BienTheGiamGiaResponse;
import com.noithat.qlnt.backend.entity.BienTheGiamGia;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.ChuongTrinhGiamGia;
import com.noithat.qlnt.backend.repository.BienTheGiamGiaRepository;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.repository.ChuongTrinhGiamGiaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BienTheGiamGiaService {

    @Autowired
    private BienTheGiamGiaRepository bienTheGiamGiaRepository;

    @Autowired
    private BienTheSanPhamRepository bienTheSanPhamRepository;

    @Autowired
    private ChuongTrinhGiamGiaRepository chuongTrinhGiamGiaRepository;

    /**
     * Lấy tất cả biến thể giảm giá với phân trang
     */
    public Page<BienTheGiamGia> getAllBienTheGiamGia(Pageable pageable) {
        return bienTheGiamGiaRepository.findAll(pageable);
    }

    /**
     * Lấy biến thể giảm giá theo chương trình giảm giá
     */
    public List<BienTheGiamGiaResponse> getBienTheGiamGiaByChuongTrinh(Integer maChuongTrinh) {
        if (!chuongTrinhGiamGiaRepository.existsById(maChuongTrinh)) {
            throw new EntityNotFoundException("Không tìm thấy chương trình giảm giá với ID: " + maChuongTrinh);
        }

        List<BienTheGiamGia> bienTheGiamGias = bienTheGiamGiaRepository
                .findByChuongTrinhGiamGia_MaChuongTrinhGiamGia(maChuongTrinh);

        return bienTheGiamGias.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy biến thể giảm giá theo biến thể sản phẩm
     */
    public List<BienTheGiamGiaResponse> getBienTheGiamGiaByBienThe(Integer maBienThe) {
        if (!bienTheSanPhamRepository.existsById(maBienThe)) {
            throw new EntityNotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + maBienThe);
        }

        List<BienTheGiamGia> bienTheGiamGias = bienTheGiamGiaRepository
                .findByBienTheSanPham_MaBienThe(maBienThe);

        return bienTheGiamGias.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Thêm biến thể vào chương trình giảm giá
     */
    @Transactional
    public BienTheGiamGiaResponse addBienTheToGiamGia(Integer maChuongTrinh, BienTheGiamGiaRequest request) {
        // Kiểm tra chương trình giảm giá tồn tại
        ChuongTrinhGiamGia chuongTrinh = chuongTrinhGiamGiaRepository.findById(maChuongTrinh)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chương trình giảm giá với ID: " + maChuongTrinh));

        // Kiểm tra biến thể sản phẩm tồn tại
        BienTheSanPham bienThe = bienTheSanPhamRepository.findById(request.getMaBienThe())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + request.getMaBienThe()));

        // Kiểm tra chương trình còn hiệu lực
        LocalDateTime now = LocalDateTime.now();
        if (chuongTrinh.getNgayKetThuc().isBefore(now)) {
            throw new IllegalStateException("Chương trình giảm giá đã hết hạn");
        }

        // Kiểm tra giá sau giảm hợp lệ
        if (request.getGiaSauGiam().compareTo(bienThe.getGiaBan()) >= 0) {
            throw new IllegalArgumentException("Giá sau giảm phải nhỏ hơn giá bán gốc");
        }

        // Tạo ID composite
        BienTheGiamGia.BienTheGiamGiaId id = new BienTheGiamGia.BienTheGiamGiaId();
        id.setMaChuongTrinhGiamGia(maChuongTrinh);
        id.setMaBienThe(request.getMaBienThe());

        // Kiểm tra đã tồn tại chưa
        if (bienTheGiamGiaRepository.existsById(id)) {
            throw new IllegalArgumentException("Biến thể đã được thêm vào chương trình giảm giá này");
        }

        // Tạo entity mới
        BienTheGiamGia bienTheGiamGia = new BienTheGiamGia();
        bienTheGiamGia.setId(id);
        bienTheGiamGia.setChuongTrinhGiamGia(chuongTrinh);
        bienTheGiamGia.setBienTheSanPham(bienThe);
        bienTheGiamGia.setGiaSauGiam(request.getGiaSauGiam());

        BienTheGiamGia saved = bienTheGiamGiaRepository.save(bienTheGiamGia);
        return convertToResponse(saved);
    }

    /**
     * Cập nhật giá sau giảm
     */
    @Transactional
    public BienTheGiamGiaResponse updateGiaSauGiam(Integer maChuongTrinh, Integer maBienThe, BigDecimal giaSauGiam) {
        BienTheGiamGia.BienTheGiamGiaId id = new BienTheGiamGia.BienTheGiamGiaId();
        id.setMaChuongTrinhGiamGia(maChuongTrinh);
        id.setMaBienThe(maBienThe);

        BienTheGiamGia bienTheGiamGia = bienTheGiamGiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể giảm giá"));

        // Kiểm tra giá sau giảm hợp lệ
        if (giaSauGiam.compareTo(bienTheGiamGia.getBienTheSanPham().getGiaBan()) >= 0) {
            throw new IllegalArgumentException("Giá sau giảm phải nhỏ hơn giá bán gốc");
        }

        bienTheGiamGia.setGiaSauGiam(giaSauGiam);
        BienTheGiamGia saved = bienTheGiamGiaRepository.save(bienTheGiamGia);
        return convertToResponse(saved);
    }

    /**
     * Xóa biến thể khỏi chương trình giảm giá
     */
    @Transactional
    public void removeBienTheFromGiamGia(Integer maChuongTrinh, Integer maBienThe) {
        BienTheGiamGia.BienTheGiamGiaId id = new BienTheGiamGia.BienTheGiamGiaId();
        id.setMaChuongTrinhGiamGia(maChuongTrinh);
        id.setMaBienThe(maBienThe);

        if (!bienTheGiamGiaRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy biến thể giảm giá để xóa");
        }

        bienTheGiamGiaRepository.deleteById(id);
    }

    /**
     * Lấy giá tốt nhất của một biến thể
     */
    public BigDecimal getBestPriceForBienThe(Integer maBienThe) {
        BienTheSanPham bienThe = bienTheSanPhamRepository.findById(maBienThe)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + maBienThe));

        List<BienTheGiamGia> activeDiscounts = bienTheGiamGiaRepository
                .findByBienTheSanPham_MaBienThe(maBienThe)
                .stream()
                .filter(btgg -> {
                    LocalDateTime now = LocalDateTime.now();
                    ChuongTrinhGiamGia ct = btgg.getChuongTrinhGiamGia();
                    return ct.getNgayBatDau().isBefore(now) && ct.getNgayKetThuc().isAfter(now);
                })
                .collect(Collectors.toList());

        if (activeDiscounts.isEmpty()) {
            return bienThe.getGiaBan();
        }

        return activeDiscounts.stream()
                .map(BienTheGiamGia::getGiaSauGiam)
                .min(BigDecimal::compareTo)
                .orElse(bienThe.getGiaBan());
    }

    /**
     * Chuyển đổi entity sang response DTO
     */
    private BienTheGiamGiaResponse convertToResponse(BienTheGiamGia entity) {
        BienTheGiamGiaResponse response = new BienTheGiamGiaResponse();
        response.setMaChuongTrinhGiamGia(entity.getId().getMaChuongTrinhGiamGia());
        response.setMaBienThe(entity.getId().getMaBienThe());
        response.setGiaSauGiam(entity.getGiaSauGiam());
        response.setTenChuongTrinh(entity.getChuongTrinhGiamGia().getTenChuongTrinh());
        response.setSkuBienThe(entity.getBienTheSanPham().getSku());
        response.setGiaGoc(entity.getBienTheSanPham().getGiaBan());
        
        // Tính phần trăm giảm giá
        BigDecimal giaGoc = entity.getBienTheSanPham().getGiaBan();
        BigDecimal giaSauGiam = entity.getGiaSauGiam();
        BigDecimal phanTramGiam = giaGoc.subtract(giaSauGiam)
                .divide(giaGoc, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        response.setPhanTramGiam(phanTramGiam);
        
        return response;
    }
}