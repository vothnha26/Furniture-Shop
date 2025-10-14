package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.request.BienTheUpdateRequestDto;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.dto.response.BienTheSanPhamDetailResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface IBienTheSanPhamService {
    /**
     * Lấy tất cả biến thể sản phẩm với phân trang
     */
    public Page<BienTheSanPham> getAllBienTheSanPham(Pageable pageable);

    /**
     * Lấy biến thể sản phẩm theo ID
     */
    BienTheSanPham getBienTheSanPhamById(Integer id);

    /**
     * Lấy danh sách biến thể theo mã sản phẩm
     */
    List<BienTheSanPham> getBienTheBySanPhamId(Integer maSanPham);

    /**
     * Tạo mới biến thể sản phẩm
     */
    BienTheSanPham createBienTheSanPham(Integer maSanPham, BienTheRequestDto request);

    /**
     * Cập nhật biến thể sản phẩm
     */
    BienTheSanPham updateBienTheSanPham(Integer id, BienTheUpdateRequestDto request);

    /**
     * Xóa biến thể sản phẩm
     */
    void deleteBienTheSanPham(Integer id);

    /**
     * Cập nhật số lượng tồn kho
     */
    BienTheSanPham updateSoLuongTon(Integer id, Integer soLuong);

    /**
     * Kiểm tra tồn kho
     */
    boolean checkTonKho(Integer id, Integer soLuongCanKiem);

    /**
     * Tìm kiếm biến thể theo SKU
     */
    BienTheSanPham findBySku(String sku);

    /**
     * Lấy thông tin chi tiết biến thể sản phẩm
     */
    BienTheSanPhamDetailResponse getBienTheSanPhamDetail(Integer id);
}