package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.KhachHangCreationRequest;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.service.KhachHangService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/khach-hang")
@Validated
public class KhachHangController {

    private final KhachHangService khachHangService;

    public KhachHangController(KhachHangService khachHangService) {
        this.khachHangService = khachHangService;
    }

    // [Quyền: Admin/Nhân viên] - Danh sách khách hàng
    @GetMapping
    public ResponseEntity<List<KhachHang>> getAll() {
        return ResponseEntity.ok(khachHangService.getAll());
    }

    // [Quyền: Admin/Nhân viên] - Tạo khách hàng
    @PostMapping
    public ResponseEntity<KhachHang> create(@Valid @RequestBody KhachHangCreationRequest request) {
        return ResponseEntity.ok(khachHangService.create(request));
    }

    // [Quyền: Admin/Nhân viên] - Cập nhật khách hàng
    @PutMapping("/{maKhachHang}")
    public ResponseEntity<KhachHang> update(@PathVariable Integer maKhachHang, @Valid @RequestBody KhachHang request) {
        return ResponseEntity.ok(khachHangService.update(maKhachHang, request));
    }

    // [Quyền: Admin/Nhân viên] - Xóa khách hàng
    @DeleteMapping("/{maKhachHang}")
    public ResponseEntity<Void> delete(@PathVariable Integer maKhachHang) {
        khachHangService.delete(maKhachHang);
        return ResponseEntity.noContent().build();
    }

    // [Quyền: Khách hàng (Auth), Nhân viên/Admin]
    @GetMapping("/{maKhachHang}")
    public ResponseEntity<KhachHang> getKhachHangProfile(@PathVariable Integer maKhachHang) {
        KhachHang khachHang = khachHangService.getKhachHangProfile(maKhachHang);
        return ResponseEntity.ok(khachHang);
    }

    // [Quyền: Admin/Nhân viên] - Dùng để tích điểm sau khi đơn hàng hoàn tất
    @PutMapping("/{maKhachHang}/tich-diem")
    public ResponseEntity<KhachHang> tichDiem(
            @PathVariable Integer maKhachHang, 
            @RequestParam(name = "diem") Integer diem
    ) {
        if (diem == null || diem <= 0) {
            return ResponseEntity.badRequest().build();
        }
        KhachHang khachHangCapNhat = khachHangService.tichDiemVaCapNhatHang(maKhachHang, diem);
        return ResponseEntity.ok(khachHangCapNhat);
    }
}