package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.response.ThanhToanResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeThanhToanResponse;
import com.noithat.qlnt.backend.dto.response.ThanhToanChiTietResponse;
import com.noithat.qlnt.backend.dto.request.ThanhToanRequest;
import com.noithat.qlnt.backend.dto.request.ThemGiaoDichRequest;
import com.noithat.qlnt.backend.dto.request.ThongTinGiaoHangRequest;

import java.util.List;

public interface ThanhToanService {

    /**
     * Lấy dữ liệu thống kê cho 4 thẻ ở trên cùng.
     */
    ThongKeThanhToanResponse getThongKe();

    /**
     * Lấy danh sách tất cả giao dịch thanh toán.
     */
     List<ThanhToanResponse> getAllThanhToan(String trangThai, String phuongThuc);

    /**
     * Lấy chi tiết một giao dịch thanh toán bằng ID.
     */
    ThanhToanChiTietResponse getThanhToanById(Integer id);

    /**
     * Cập nhật trạng thái của một giao dịch (vd: "Chờ xử lý" -> "Hoàn thành").
     */
    ThanhToanResponse updateTrangThai(Integer id, String newStatus);

    List<ThanhToanResponse> getByDonHang(Integer maDonHang);
    ThanhToanChiTietResponse themMoiGiaoDich(ThemGiaoDichRequest request);

    List<ThanhToanResponse> xemGioHang(List<ThanhToanRequest> danhSachSanPham);

    // Bước 2: Xác nhận thông tin giao hàng
    ThanhToanResponse thongTinGiaoHang(ThanhToanRequest request);

    ThanhToanResponse taoDonHangTuUser(ThongTinGiaoHangRequest request);
}