package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.DonHangRequest;
import com.noithat.qlnt.backend.dto.response.DonHangResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeBanHangResponse;

import java.util.List;

public interface IDonHangService {
    DonHangResponse taoDonHang(DonHangRequest request);
    DonHangResponse getDonHangById(Integer id);
    void xoaDonHang(Integer id);
    List<DonHangResponse> getTatCaDonHang();
    void capNhatTrangThai(Integer id, String trangThai);
    ThongKeBanHangResponse thongKeBanHang();
}
