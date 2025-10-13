package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.DonHangRequest;
import com.noithat.qlnt.backend.dto.response.DonHangResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeBanHangResponse;
import com.noithat.qlnt.backend.service.DonHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banhang")
@RequiredArgsConstructor
public class BanHangController {

    private final DonHangService donHangService;

    @PostMapping("/donhang")
    public ResponseEntity<DonHangResponse> taoDonHang(@Valid @RequestBody DonHangRequest request) {
        return ResponseEntity.ok(donHangService.taoDonHang(request));
    }

    @GetMapping("/donhang")
    public ResponseEntity<List<DonHangResponse>> getTatCaDonHang() {
        return ResponseEntity.ok(donHangService.getTatCaDonHang());
    }

    @GetMapping("/donhang/{id}")
    public ResponseEntity<DonHangResponse> getDonHangById(@PathVariable Integer id) {
        return ResponseEntity.ok(donHangService.getDonHangById(id));
    }

    @DeleteMapping("/donhang/{id}")
    public ResponseEntity<Void> xoaDonHang(@PathVariable Integer id) {
        donHangService.xoaDonHang(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/donhang/{id}/trangthai")
    public ResponseEntity<?> capNhatTrangThai(
        @PathVariable Integer id,
        @RequestBody Map<String, String> body) {

    String trangThai = body.get("trangThai");
    donHangService.capNhatTrangThai(id, trangThai);
    return ResponseEntity.ok("Cập nhật trạng thái thành công");
}


    // ✅ Thống kê bán hàng (4 mục)
    @GetMapping("/thongke")
    public ResponseEntity<ThongKeBanHangResponse> thongKeBanHang() {
        return ResponseEntity.ok(donHangService.thongKeBanHang());
    }
}
