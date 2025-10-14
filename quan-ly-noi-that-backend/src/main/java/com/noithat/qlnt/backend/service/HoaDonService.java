package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.TaoHoaDonRequest;
import com.noithat.qlnt.backend.dto.request.UpdateHoaDonRequest;
import com.noithat.qlnt.backend.dto.response.HoaDonChiTietResponse;
import com.noithat.qlnt.backend.dto.response.HoaDonResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeHoaDonResponse;
import java.util.List;

public interface HoaDonService {
    ThongKeHoaDonResponse getThongKe();
    List<HoaDonResponse> getAllHoaDon(String search);
    HoaDonChiTietResponse getHoaDonById(Integer id);
    HoaDonResponse taoHoaDon(TaoHoaDonRequest request); // Dùng cho luồng tự động
    HoaDonResponse updateHoaDon(Integer id, UpdateHoaDonRequest request);
    void deleteHoaDon(Integer id);
    byte[] generateInvoicePdfForDonHang(Integer maDonHang);
}