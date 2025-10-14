package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.BienTheGiamGiaRequest;
import com.noithat.qlnt.backend.dto.response.BienTheGiamGiaResponse;
import com.noithat.qlnt.backend.entity.BienTheGiamGia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public interface IBienTheGiamGiaService {
    /**
     * Lấy tất cả biến thể giảm giá với phân trang
     */
    public Page<BienTheGiamGia> getAllBienTheGiamGia(Pageable pageable);

    /**
     * Lấy biến thể giảm giá theo chương trình giảm giá
     */
    List<BienTheGiamGiaResponse> getBienTheGiamGiaByChuongTrinh(Integer maChuongTrinh);

    /**
     * Lấy biến thể giảm giá theo biến thể sản phẩm
     */
    List<BienTheGiamGiaResponse> getBienTheGiamGiaByBienThe(Integer maBienThe);

    /**
     * Thêm biến thể vào chương trình giảm giá
     */
    BienTheGiamGiaResponse addBienTheToGiamGia(Integer maChuongTrinh, BienTheGiamGiaRequest request);

    /**
     * Cập nhật giá sau giảm
     */
    BienTheGiamGiaResponse updateGiaSauGiam(Integer maChuongTrinh, Integer maBienThe, BigDecimal giaSauGiam);

    /**
     * Xóa biến thể khỏi chương trình giảm giá
     */
    void removeBienTheFromGiamGia(Integer maChuongTrinh, Integer maBienThe);

    /**
     * Lấy giá tốt nhất của một biến thể
     */
    BigDecimal getBestPriceForBienThe(Integer maBienThe);
}