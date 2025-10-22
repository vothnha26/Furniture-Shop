package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.DonHangRequest;
import com.noithat.qlnt.backend.dto.request.ThanhToanRequest;
import com.noithat.qlnt.backend.dto.request.ThongTinGiaoHangRequest;
import com.noithat.qlnt.backend.dto.response.ThanhToanResponse;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.service.ThanhToanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminOrderController {

    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final ThanhToanService thanhToanService;

    // Search variants by SKU or product name
    @GetMapping("/san-pham/search")
    public ResponseEntity<List<Map<String, Object>>> searchVariants(@RequestParam("q") String q) {
        List<BienTheSanPham> list = bienTheSanPhamRepository.searchBySkuOrProductName(q);
        List<Map<String, Object>> out = list.stream().map(b -> {
            return Map.of(
                    "maBienThe", b.getMaBienThe(),
                    "sku", b.getSku(),
                    "tenSanPham", b.getSanPham() != null ? b.getSanPham().getTenSanPham() : null,
                    "giaBan", b.getGiaBan(),
                    "soLuongTon", b.getSoLuongTon(),
                    "attributes", b.getGiaTriThuocTinhs() // helper method returns list of attribute values
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    // Admin creates order - DÙNG CHUNG LOGIC VỚI CUSTOMER
    @PostMapping("/don-hang")
    public ResponseEntity<?> createOrderAsAdmin(@RequestBody DonHangRequest request) {
        try {
            // Map DonHangRequest -> ThongTinGiaoHangRequest để dùng chung service với customer
            ThongTinGiaoHangRequest thongTinRequest = new ThongTinGiaoHangRequest();
            thongTinRequest.setMaKhachHang(request.getMaKhachHang());
            thongTinRequest.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
            
            // Map chiTietDonHangList từ DonHangRequest sang ThanhToanRequest
            List<ThanhToanRequest> chiTietList = request.getChiTietDonHangList().stream()
                .map(ct -> {
                    ThanhToanRequest tt = new ThanhToanRequest();
                    tt.setMaBienThe(ct.getMaBienThe());
                    tt.setSoLuong(ct.getSoLuong());
                    return tt;
                })
                .collect(Collectors.toList());
            thongTinRequest.setChiTietDonHangList(chiTietList);
            
            thongTinRequest.setTenNguoiNhan(request.getTenNguoiNhan());
            thongTinRequest.setSoDienThoaiNhan(request.getSoDienThoaiNhan());
            thongTinRequest.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
            thongTinRequest.setGhiChu(request.getGhiChu());
            thongTinRequest.setPhuongThucGiaoHang("Giao hàng tiêu chuẩn");
            thongTinRequest.setMaVoucherCode(request.getMaVoucherCode());
            thongTinRequest.setDiemThuongSuDung(request.getDiemThuongSuDung() != null ? request.getDiemThuongSuDung() : 0);
            
            // Gọi service CHUNG với customer (dùng stored procedure)
            ThanhToanResponse resp = thanhToanService.taoDonHangTuUser(thongTinRequest);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            java.util.Map<String, Object> err = new java.util.HashMap<>();
            err.put("success", false);
            err.put("message", "Lỗi khi tạo đơn hàng: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }
}
