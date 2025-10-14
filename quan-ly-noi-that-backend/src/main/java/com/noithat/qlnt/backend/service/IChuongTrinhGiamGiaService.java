package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.ChuongTrinhGiamGiaRequest;
import com.noithat.qlnt.backend.dto.request.ChuongTrinhGiamGiaDetailRequest;
import com.noithat.qlnt.backend.dto.response.BienTheSanPhamGiaResponse;
import com.noithat.qlnt.backend.dto.response.ChuongTrinhGiamGiaResponse;
import com.noithat.qlnt.backend.entity.ChuongTrinhGiamGia;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

public interface IChuongTrinhGiamGiaService {
    List<ChuongTrinhGiamGia> getAll();
    ChuongTrinhGiamGia getById(Integer id);
    ChuongTrinhGiamGia create(String ten, LocalDateTime start, LocalDateTime end);
    ChuongTrinhGiamGia create(ChuongTrinhGiamGiaRequest request);
    ChuongTrinhGiamGia update(Integer id, String ten, LocalDateTime start, LocalDateTime end);
    void delete(Integer id);
    void upsertBienTheGia(Integer maChuongTrinh, Integer maBienThe, BigDecimal giaSauGiam);
    void removeBienTheGia(Integer maChuongTrinh, Integer maBienThe);
    BigDecimal getGiaHienThi(Integer maBienThe);
    BienTheSanPhamGiaResponse getBienTheGiaChiTiet(Integer maBienThe);
    ChuongTrinhGiamGiaResponse createWithDetails(ChuongTrinhGiamGiaDetailRequest request);
    ChuongTrinhGiamGiaResponse updateWithDetails(Integer id, ChuongTrinhGiamGiaDetailRequest request);
    ChuongTrinhGiamGiaResponse getDetailById(Integer id);
    List<ChuongTrinhGiamGiaResponse> getAllWithDetails();
}
