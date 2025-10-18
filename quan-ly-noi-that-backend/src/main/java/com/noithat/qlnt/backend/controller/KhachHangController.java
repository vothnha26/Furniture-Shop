package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.KhachHangCreationRequest;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.entity.DonHang;
import com.noithat.qlnt.backend.service.IKhachHangService;
import com.noithat.qlnt.backend.service.IDonHangService;
import com.noithat.qlnt.backend.service.IQuanLyTrangThaiDonHangService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.noithat.qlnt.backend.repository.KhachHangRepository;
import com.noithat.qlnt.backend.repository.DonHangRepository;
import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/khach-hang")
@Validated
public class KhachHangController {

    private final IKhachHangService khachHangService;
    private final IDonHangService donHangService;
    private final KhachHangRepository khachHangRepository;
    private final DonHangRepository donHangRepository;
    private final IQuanLyTrangThaiDonHangService quanLyTrangThaiService;

    public KhachHangController(IKhachHangService khachHangService, IDonHangService donHangService,
            KhachHangRepository khachHangRepository, DonHangRepository donHangRepository,
            IQuanLyTrangThaiDonHangService quanLyTrangThaiService) {
        this.khachHangService = khachHangService;
        this.donHangService = donHangService;
        this.khachHangRepository = khachHangRepository;
        this.donHangRepository = donHangRepository;
        this.quanLyTrangThaiService = quanLyTrangThaiService;
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

    // [Quyền: Khách hàng (Auth)] - Lấy profile của chính mình (dựa trên
    // session/token)
    @GetMapping("/me")
    public ResponseEntity<KhachHang> getMyProfile(java.security.Principal principal) {
        // Check principal early and return 401 immediately if not authenticated
        if (principal == null) {
            System.err.println("[KhachHangController] /me called with null principal - not authenticated");
            return ResponseEntity.status(401).build();
        }
        
        String username = principal.getName();
        System.out.println("[KhachHangController] /me called for user: " + username);
        
        // First try to find customer by linked account username (TaiKhoan.tenDangNhap)
        try {
            java.util.Optional<KhachHang> maybe = khachHangRepository
                    .findByTaiKhoan_TenDangNhap(username);
            System.out.println("[KhachHangController] Repository lookup result: " + maybe);
            if (maybe != null && maybe.isPresent()) {
                System.out.println("[KhachHangController] Found customer by tenDangNhap: " + maybe.get().getMaKhachHang());
                return ResponseEntity.ok(maybe.get());
            }
        } catch (Exception ex) {
            // log and continue to phone fallback
            System.err.println("[KhachHangController] repo lookup failed: " + ex.getMessage());
            ex.printStackTrace();
        }

        // Fallback: maybe the principal is a phone number (legacy behavior)
        try {
            KhachHang byPhone = khachHangService.findBySoDienThoai(username);
            if (byPhone != null) {
                System.out.println("[KhachHangController] Found customer by phone: " + byPhone.getMaKhachHang());
                return ResponseEntity.ok(byPhone);
            }
        } catch (Exception ex) {
            System.err.println("[KhachHangController] phone lookup failed: " + ex.getMessage());
        }

        System.err.println("[KhachHangController] No customer found for username: " + username);
        return ResponseEntity.status(404).build();
    }

    // [Quyền: Khách hàng (Auth), Nhân viên/Admin] - Lấy danh sách đơn hàng của
    // khách hàng
    @GetMapping("/{maKhachHang}/don-hang")
    public ResponseEntity<java.util.List<com.noithat.qlnt.backend.dto.response.DonHangResponse>> getDonHangByKhachHang(
            @PathVariable Integer maKhachHang) {
        java.util.List<com.noithat.qlnt.backend.dto.response.DonHangResponse> ds = donHangService
                .getDonHangByKhachHang(maKhachHang);
        return ResponseEntity.ok(ds);
    }

    // [Quyền: Admin/Nhân viên] - Dùng để tích điểm sau khi đơn hàng hoàn tất
    @PutMapping("/{maKhachHang}/tich-diem")
    public ResponseEntity<KhachHang> tichDiem(
            @PathVariable Integer maKhachHang,
            @RequestParam(name = "diem") Integer diem) {
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

    // [Quyền: Admin/Nhân viên] - Thêm điểm cho khách hàng (POST /tich-diem) -
    // supports POST with JSON body
    @PostMapping("/tich-diem")
    public ResponseEntity<KhachHang> addPointsPost(
            @RequestBody com.noithat.qlnt.backend.dto.request.TichDiemRequest request) {
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
        if (kh == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(kh);
    }

    // [Quyền: Khách hàng] - Xác nhận đã nhận hàng (DA_GIAO_HANG -> HOAN_THANH)
    @PostMapping("/{maKhachHang}/don-hang/{maDonHang}/xac-nhan-nhan-hang")
    public ResponseEntity<?> xacNhanNhanHang(
            @PathVariable Integer maKhachHang,
            @PathVariable Integer maDonHang,
            java.security.Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body("Vui lòng đăng nhập");
        }

        try {
            // Verify customer owns this order
            DonHang donHang = donHangRepository.findById(maDonHang)
                    .orElse(null);
            
            if (donHang == null) {
                return ResponseEntity.status(404).body("Không tìm thấy đơn hàng");
            }
            
            if (!donHang.getKhachHang().getMaKhachHang().equals(maKhachHang)) {
                return ResponseEntity.status(403).body("Bạn không có quyền xác nhận đơn hàng này");
            }

            // Check if order is in "DA_GIAO_HANG" status
            if (!"DA_GIAO_HANG".equals(donHang.getTrangThaiDonHang())) {
                return ResponseEntity.status(400).body("Chỉ có thể xác nhận đơn hàng đã được giao");
            }

            // Update status to HOAN_THANH with customer confirmation
            quanLyTrangThaiService.capNhatTrangThai(
                maDonHang, 
                "HOAN_THANH", 
                "Khách hàng (ID: " + maKhachHang + ")", 
                "Khách hàng xác nhận đã nhận hàng"
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã xác nhận nhận hàng thành công"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}