package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.ThanhToanRequest;
import com.noithat.qlnt.backend.dto.request.ThemGiaoDichRequest;
import com.noithat.qlnt.backend.dto.request.ThongTinGiaoHangRequest;
import com.noithat.qlnt.backend.dto.response.ThanhToanChiTietResponse;
import com.noithat.qlnt.backend.dto.response.ThanhToanResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeThanhToanResponse;
import com.noithat.qlnt.backend.service.ThanhToanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thanhtoan")
@RequiredArgsConstructor
public class ThanhToanController {

    private final ThanhToanService thanhToanService;

    /**
     * API để lấy dữ liệu cho 4 thẻ thống kê ở trên cùng.
     * @return Dữ liệu thống kê.
     */
    @GetMapping("/thongke")
    public ResponseEntity<ThongKeThanhToanResponse> getThongKeThanhToan() {
        return ResponseEntity.ok(thanhToanService.getThongKe());
    }

    /**
     * API để lấy danh sách giao dịch, có hỗ trợ lọc theo trạng thái và phương thức.
     * @param trangThai Trạng thái cần lọc (ví dụ: "Hoàn thành"). Tùy chọn.
     * @param phuongThuc Phương thức thanh toán cần lọc (ví dụ: "Tiền mặt"). Tùy chọn.
     * @return Danh sách các giao dịch thanh toán đã được lọc.
     */
    @GetMapping
    public ResponseEntity<List<ThanhToanResponse>> getTatCaThanhToan(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String phuongThuc) {
        return ResponseEntity.ok(thanhToanService.getAllThanhToan(trangThai, phuongThuc));
    }

    /**
     * API để xem chi tiết một giao dịch (dùng cho pop-up chi tiết).
     * @param id Mã của giao dịch cần xem.
     * @return Dữ liệu chi tiết của giao dịch.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ThanhToanChiTietResponse> getThanhToanById(@PathVariable Integer id) {
        return ResponseEntity.ok(thanhToanService.getThanhToanById(id));
    }

    /**
     * API để lấy tất cả các giao dịch của một đơn hàng cụ thể.
     * @param maDonHang Mã của đơn hàng.
     * @return Danh sách các giao dịch thuộc đơn hàng đó.
     */
    @GetMapping("/donhang/{maDonHang}")
    public ResponseEntity<List<ThanhToanResponse>> getThanhToanByDonHang(@PathVariable Integer maDonHang) {
        return ResponseEntity.ok(thanhToanService.getByDonHang(maDonHang));
    }

    /**
     * API để tạo một giao dịch thanh toán mới.
     * @param request Dữ liệu giao dịch mới từ form.
     * @return Chi tiết của giao dịch vừa được tạo.
     */
    @PostMapping
    public ResponseEntity<ThanhToanChiTietResponse> themGiaoDichMoi(@Valid @RequestBody ThemGiaoDichRequest request) {
        return ResponseEntity.ok(thanhToanService.themMoiGiaoDich(request));
    }

    /**
     * API để cập nhật trạng thái của một giao dịch.
     * @param id Mã của giao dịch cần cập nhật.
     * @param body Request body có dạng: { "trangThai": "Hoàn thành" }.
     * @return Dữ liệu của giao dịch sau khi đã cập nhật.
     */
    @PatchMapping("/{id}/trangthai")
    public ResponseEntity<ThanhToanResponse> capNhatTrangThai(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("trangThai");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            // Trả về lỗi 400 nếu không có 'trangThai' trong body
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(thanhToanService.updateTrangThai(id, newStatus));
    }

    @PostMapping("/xem-gio-hang")
    public ResponseEntity<?> xemGioHang(@RequestBody List<ThanhToanRequest> dsSanPham) {
        try {
            return ResponseEntity.ok(thanhToanService.xemGioHang(dsSanPham));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xem giỏ hàng: " + e.getMessage());
        }
    }

    // 🚚 Bước 2: Nhập thông tin giao hàng
    @PostMapping("/thong-tin-giao-hang")
    public ResponseEntity<String> thongTinGiaoHang(@RequestBody ThongTinGiaoHangRequest request) {
        return ResponseEntity.ok("Đã nhận thông tin giao hàng: " + request.getDiaChiGiaoHang());
    }

    @PostMapping("/tao-don-hang")
    public ResponseEntity<ThanhToanResponse> taoDonHangTuUser(@RequestBody ThongTinGiaoHangRequest request) {
        ThanhToanResponse resp = thanhToanService.taoDonHangTuUser(request);
        return ResponseEntity.ok(resp);
    }
}