package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.ThongBaoRequest;
import com.noithat.qlnt.backend.dto.response.ThongBaoResponse;
import com.noithat.qlnt.backend.entity.ThongBao;
import com.noithat.qlnt.backend.service.IThongBaoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller quản lý Thông báo cho Admin/Nhân viên
 * Base path: /api/v1/thong-bao
 */
@RestController
@RequestMapping("/api/v1/thong-bao")
public class ThongBaoController {
    
    private final IThongBaoService thongBaoService;
    
    public ThongBaoController(IThongBaoService thongBaoService) {
        this.thongBaoService = thongBaoService;
    }
    
    // ==================== GET Endpoints ====================
    
    /**
     * GET /api/v1/thong-bao
     * Lấy tất cả thông báo (chưa bị xóa)
     * Quyền: Admin/Nhân viên
     */
    @GetMapping
    public ResponseEntity<List<ThongBao>> getAll() {
        List<ThongBao> notifications = thongBaoService.getAll();
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * GET /api/v1/thong-bao/all
     * Lấy tất cả thông báo (alias endpoint)
     */
    @GetMapping("/all")
    public ResponseEntity<List<ThongBao>> getAllAlias() {
        return getAll();
    }
    
    /**
     * GET /api/v1/thong-bao/details
     * Lấy tất cả thông báo với Response format (snake_case cho frontend)
     */
    @GetMapping("/details")
    public ResponseEntity<List<ThongBaoResponse>> getAllWithDetails() {
        List<ThongBaoResponse> notifications = thongBaoService.getAllWithResponse();
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * GET /api/v1/thong-bao/{id}
     * Lấy thông báo theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ThongBao> getById(@PathVariable Integer id) {
        ThongBao notification = thongBaoService.getById(id);
        return ResponseEntity.ok(notification);
    }
    
    /**
     * GET /api/v1/thong-bao/{id}/details
     * Lấy thông báo theo ID với Response format
     */
    @GetMapping("/{id}/details")
    public ResponseEntity<ThongBaoResponse> getByIdWithDetails(@PathVariable Integer id) {
        ThongBaoResponse notification = thongBaoService.getByIdWithResponse(id);
        return ResponseEntity.ok(notification);
    }
    
    /**
     * GET /api/v1/thong-bao/me
     * Lấy thông báo của người dùng đang đăng nhập
     * Bao gồm cả thông báo cho ALL và thông báo riêng cho user
     */
    @GetMapping("/me")
    public ResponseEntity<List<ThongBao>> getMyNotifications(Principal principal) {
        if (principal == null) {
            System.err.println("[ThongBaoController] /me called without authentication");
            // Trả về thông báo cho ALL nếu không có authentication
            List<ThongBao> notifications = thongBaoService.getNotificationsForUser(null, "ALL");
            return ResponseEntity.ok(notifications);
        }
        
        String username = principal.getName();
        System.out.println("[ThongBaoController] /me called for user: " + username);
        
        // TODO: Implement proper user lookup to get nguoiNhanId and loaiNguoiNhan
        // For now, return all notifications for ALL users
        List<ThongBao> notifications = thongBaoService.getNotificationsForUser(null, "ALL");
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * GET /api/v1/thong-bao/loai/{loai}
     * Lấy thông báo theo loại (success, warning, error, info, order, customer, inventory)
     */
    @GetMapping("/loai/{loai}")
    public ResponseEntity<List<ThongBao>> getByLoai(@PathVariable String loai) {
        List<ThongBao> notifications = thongBaoService.getByLoai(loai);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * GET /api/v1/thong-bao/chua-doc
     * Lấy thông báo chưa đọc của người dùng
     */
    @GetMapping("/chua-doc")
    public ResponseEntity<List<ThongBao>> getChuaDoc(Principal principal) {
        // For now, return unread notifications for ALL
        List<ThongBao> notifications = thongBaoService.getChuaDoc(null, "ALL");
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * GET /api/v1/thong-bao/chua-doc/count
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/chua-doc/count")
    public ResponseEntity<Map<String, Long>> countChuaDoc(Principal principal) {
        long count = thongBaoService.countChuaDoc(null, "ALL");
        return ResponseEntity.ok(Map.of("count", count, "unread", count));
    }
    
    /**
     * GET /api/v1/thong-bao/uu-tien-cao
     * Lấy thông báo ưu tiên cao chưa đọc
     */
    @GetMapping("/uu-tien-cao")
    public ResponseEntity<List<ThongBao>> getHighPriorityUnread(Principal principal) {
        List<ThongBao> notifications = thongBaoService.getHighPriorityUnread(null, "ALL");
        return ResponseEntity.ok(notifications);
    }
    
    // ==================== POST Endpoints ====================
    
    /**
     * POST /api/v1/thong-bao
     * Tạo thông báo mới
     * Quyền: Admin/Nhân viên
     */
    @PostMapping
    public ResponseEntity<ThongBao> create(@Valid @RequestBody ThongBaoRequest request) {
        ThongBao created = thongBaoService.create(request);
        return ResponseEntity.ok(created);
    }
    
    /**
     * POST /api/v1/thong-bao/create
     * Tạo thông báo mới và trả về Response format
     */
    @PostMapping("/create")
    public ResponseEntity<ThongBaoResponse> createWithResponse(@Valid @RequestBody ThongBaoRequest request) {
        ThongBaoResponse created = thongBaoService.createWithResponse(request);
        return ResponseEntity.ok(created);
    }
    
    /**
     * POST /api/v1/thong-bao/tong-quat
     * Tạo thông báo tổng quát nhanh
     */
    @PostMapping("/tong-quat")
    public ResponseEntity<ThongBao> taoThongBaoTongQuat(@RequestBody Map<String, String> request) {
        String loai = request.getOrDefault("loai", "info");
        String tieuDe = request.get("tieuDe");
        String noiDung = request.get("noiDung");
        String loaiNguoiNhan = request.getOrDefault("loaiNguoiNhan", "ALL");
        String doUuTien = request.getOrDefault("doUuTien", "normal");
        
        if (tieuDe == null || noiDung == null) {
            return ResponseEntity.badRequest().build();
        }
        
        ThongBao created = thongBaoService.taoThongBaoTongQuat(loai, tieuDe, noiDung, loaiNguoiNhan, doUuTien);
        return ResponseEntity.ok(created);
    }
    
    // ==================== PUT Endpoints ====================
    
    /**
     * PUT /api/v1/thong-bao/{id}
     * Cập nhật thông báo
     */
    @PutMapping("/{id}")
    public ResponseEntity<ThongBao> update(
            @PathVariable Integer id,
            @Valid @RequestBody ThongBaoRequest request) {
        ThongBao updated = thongBaoService.update(id, request);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * PUT /api/v1/thong-bao/{id}/danh-dau-da-doc
     * Đánh dấu một thông báo là đã đọc
     */
    @PutMapping("/{id}/danh-dau-da-doc")
    public ResponseEntity<Map<String, String>> danhDauDaDoc(@PathVariable Integer id) {
        try {
            thongBaoService.danhDauDaDoc(id);
            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "Đã đánh dấu thông báo là đã đọc"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }
    
    /**
     * PUT /api/v1/thong-bao/danh-dau-tat-ca-da-doc
     * Đánh dấu tất cả thông báo của người dùng là đã đọc
     */
    @PutMapping("/danh-dau-tat-ca-da-doc")
    public ResponseEntity<Map<String, String>> danhDauTatCaDaDoc(Principal principal) {
        try {
            // For now, mark all notifications for ALL as read
            thongBaoService.danhDauTatCaDaDoc(null, "ALL");
            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "Đã đánh dấu tất cả thông báo là đã đọc"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }
    
    // ==================== DELETE Endpoints ====================
    
    /**
     * DELETE /api/v1/thong-bao/{id}
     * Xóa thông báo (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        thongBaoService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * DELETE /api/v1/thong-bao/{id}/vinh-vien
     * Xóa vĩnh viễn thông báo (hard delete)
     * Quyền: Chỉ Admin
     */
    @DeleteMapping("/{id}/vinh-vien")
    public ResponseEntity<Void> permanentDelete(@PathVariable Integer id) {
        thongBaoService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }
    
    // ==================== Maintenance Endpoints ====================
    
    /**
     * POST /api/v1/thong-bao/maintenance/xoa-cu
     * Xóa thông báo cũ (>30 ngày) - soft delete
     * Quyền: Admin
     */
    @PostMapping("/maintenance/xoa-cu")
    public ResponseEntity<Map<String, Object>> xoaThongBaoCu() {
        int deleted = thongBaoService.xoaThongBaoCu();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "deleted", deleted,
            "message", "Đã soft delete " + deleted + " thông báo cũ (>30 ngày)"
        ));
    }
    
    /**
     * POST /api/v1/thong-bao/maintenance/xoa-vinh-vien
     * Xóa vĩnh viễn thông báo đã soft delete >90 ngày
     * Quyền: Admin
     */
    @PostMapping("/maintenance/xoa-vinh-vien")
    public ResponseEntity<Map<String, Object>> xoaVinhVienThongBaoCu() {
        int deleted = thongBaoService.xoaVinhVienThongBaoCu();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "deleted", deleted,
            "message", "Đã xóa vĩnh viễn " + deleted + " thông báo (đã soft delete >90 ngày)"
        ));
    }
    
    // ==================== Test/Debug Endpoints ====================
    
    /**
     * POST /api/v1/thong-bao/test/don-hang-moi
     * Test tạo thông báo đơn hàng mới
     */
    @PostMapping("/test/don-hang-moi")
    public ResponseEntity<Map<String, String>> testDonHangMoi(@RequestBody Map<String, Integer> request) {
        Integer maDonHang = request.get("maDonHang");
        if (maDonHang == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "message", "Thiếu maDonHang"
            ));
        }
        
        try {
            thongBaoService.taoThongBaoDonHangMoi(maDonHang);
            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "Đã tạo thông báo đơn hàng mới"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }
    
    /**
     * POST /api/v1/thong-bao/test/canh-bao-ton-kho
     * Test tạo cảnh báo tồn kho
     */
    @PostMapping("/test/canh-bao-ton-kho")
    public ResponseEntity<Map<String, String>> testCanhBaoTonKho(@RequestBody Map<String, Object> request) {
        Integer maSanPham = (Integer) request.get("maSanPham");
        String tenSanPham = (String) request.get("tenSanPham");
        Integer soLuongTon = (Integer) request.get("soLuongTon");
        
        if (maSanPham == null || tenSanPham == null || soLuongTon == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "message", "Thiếu thông tin"
            ));
        }
        
        try {
            thongBaoService.taoThongBaoCanhBaoTonKho(maSanPham, tenSanPham, soLuongTon);
            return ResponseEntity.ok(Map.of(
                "success", "true",
                "message", "Đã tạo cảnh báo tồn kho"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", "false",
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }
}
