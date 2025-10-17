package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.KhachHangCreationRequest;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.service.IKhachHangService;
import com.noithat.qlnt.backend.service.IDonHangService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/khach-hang")
@Validated
public class KhachHangController {

    private final IKhachHangService khachHangService;
    private final IDonHangService donHangService;

    public KhachHangController(IKhachHangService khachHangService, IDonHangService donHangService) {
        this.khachHangService = khachHangService;
        this.donHangService = donHangService;
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

    // [Quyền: Khách hàng (Auth), Nhân viên/Admin] - Lấy danh sách đơn hàng của khách hàng
    @GetMapping("/{maKhachHang}/don-hang")
    public ResponseEntity<java.util.List<com.noithat.qlnt.backend.dto.response.DonHangResponse>> getDonHangByKhachHang(
            @PathVariable Integer maKhachHang) {
    java.util.List<com.noithat.qlnt.backend.dto.response.DonHangResponse> ds =
        donHangService.getDonHangByKhachHang(maKhachHang);
        return ResponseEntity.ok(ds);
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
    
    // [Quyền: Admin/Nhân viên] - Thêm điểm cho khách hàng (cho Postman test)
    @PostMapping("/add-points")
    public ResponseEntity<KhachHang> addPoints(@RequestBody java.util.Map<String, Object> request) {
        Integer maKhachHang = (Integer) request.get("maKhachHang");
        Integer diemThem = (Integer) request.get("diemThem");
        
        if (maKhachHang == null || diemThem == null || diemThem <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        KhachHang khachHangCapNhat = khachHangService.tichDiemVaCapNhatHang(maKhachHang, diemThem);
        return ResponseEntity.ok(khachHangCapNhat);
    }

    // [Quyền: Admin/Nhân viên] - Thêm điểm cho khách hàng (POST /tich-diem) - supports POST with JSON body
    @PostMapping("/tich-diem")
    public ResponseEntity<KhachHang> addPointsPost(@RequestBody com.noithat.qlnt.backend.dto.request.TichDiemRequest request) {
        Integer maKhachHang = request.getMaKhachHang();
        // Use compatibility getter that prefers 'diem' but falls back to 'diemThem'
        Integer diemThem = request.getEffectiveDiem();

        if (maKhachHang == null || diemThem == null || diemThem <= 0) {
            return ResponseEntity.badRequest().build();
        }

        KhachHang khachHangCapNhat = khachHangService.tichDiemVaCapNhatHang(maKhachHang, diemThem);
        return ResponseEntity.ok(khachHangCapNhat);
    }

    // [Quyền: Admin/Nhân viên] - Tìm kiếm khách hàng
    @GetMapping("/search")
    public ResponseEntity<List<KhachHang>> search(@RequestParam("keyword") String keyword) {
        // Simple search by name for now
        List<KhachHang> allCustomers = khachHangService.getAll();
        List<KhachHang> result = allCustomers.stream()
            .filter(kh -> kh.getHoTen().toLowerCase().contains(keyword.toLowerCase()) ||
                         kh.getEmail().toLowerCase().contains(keyword.toLowerCase()) ||
                         kh.getSoDienThoai().contains(keyword))
            .toList();
        return ResponseEntity.ok(result);
    }

    // [Quyền: Admin/Nhân viên] - Tìm khách hàng theo số điện thoại (exact match)
    @GetMapping("/by-phone/{phone}")
    public ResponseEntity<KhachHang> getByPhone(@PathVariable("phone") String phone) {
        KhachHang kh = khachHangService.findBySoDienThoai(phone);
        if (kh == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(kh);
    }
}