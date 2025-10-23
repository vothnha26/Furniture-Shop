package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.response.DonHangResponse;
import com.noithat.qlnt.backend.entity.LichSuTrangThaiDonHang;
import com.noithat.qlnt.backend.service.IDonHangService;
import com.noithat.qlnt.backend.service.IQuanLyTrangThaiDonHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal controller to support frontend order tracking routes used by the customer UI.
 * Provides two endpoints:
 * - GET /api/v1/theo-doi-don-hang/{maDonHang}
 * - GET /api/v1/theo-doi-don-hang/ma-van-don/{maVanDon}
 */
@RestController
@RequestMapping("/api/v1/theo-doi-don-hang")
@RequiredArgsConstructor
public class OrderTrackingController {

    private final IDonHangService donHangService;
    private final IQuanLyTrangThaiDonHangService orderStatusService;

    @GetMapping("/{maDonHang}")
    public ResponseEntity<?> getTrackingByOrderId(@PathVariable Integer maDonHang) {
        try {
            DonHangResponse resp = donHangService.getDonHangById(maDonHang);
            if (resp == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> payload = buildTrackingPayloadFromResponse(resp);
            List<LichSuTrangThaiDonHang> history = orderStatusService.getOrderStatusHistory(maDonHang);
            payload.put("lich_su_van_chuyen", history);

            return ResponseEntity.ok(payload);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    private Map<String, Object> buildTrackingPayloadFromResponse(DonHangResponse resp) {
        Map<String, Object> p = new HashMap<>();
        p.put("ma_don_hang", resp.getMaDonHang());
        p.put("trang_thai", resp.getTrangThai());
        p.put("ten_khach_hang", resp.getTenKhachHang());
        p.put("sdt_khach_hang", ""); // phone not returned in DonHangResponse currently
        p.put("dia_chi_giao_hang", ""); // address not returned in DonHangResponse currently
        p.put("ngay_giao_hang_du_kien", null);
        p.put("ngay_giao_hang_thuc_te", null);
        p.put("san_pham", resp.getChiTietDonHangList());
        return p;
    }
}
