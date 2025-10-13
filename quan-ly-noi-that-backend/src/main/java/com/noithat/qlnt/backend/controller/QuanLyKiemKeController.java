package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.entity.KiemKeKho;
import com.noithat.qlnt.backend.entity.KiemKeChiTiet;
import com.noithat.qlnt.backend.service.QuanLyKiemKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/quan-ly-kiem-ke")
public class QuanLyKiemKeController {

    @Autowired
    private QuanLyKiemKeService quanLyKiemKeService;

    // =================== INVENTORY CHECK OPERATIONS ===================

    /**
     * Tạo phiếu kiểm kê mới
     * POST /api/v1/quan-ly-kiem-ke/tao-kiem-ke
     */
    // [ĐÃ SỬA] Đường dẫn từ "/create" -> "/tao-kiem-ke"
    @PostMapping("/tao-kiem-ke")
    public ResponseEntity<Map<String, Object>> createInventoryCheck(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String tenKiemKe = (String) request.get("tenKiemKe");
            String moTa = (String) request.get("moTa");
            String nguoiTao = (String) request.get("nguoiTao");

            KiemKeKho kiemKeKho = quanLyKiemKeService.createInventoryCheck(tenKiemKe, moTa, nguoiTao);
            
            response.put("success", true);
            response.put("message", "Tạo phiếu kiểm kê thành công");
            response.put("data", kiemKeKho);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Tạo kiểm kê toàn bộ kho
     * POST /api/v1/quan-ly-kiem-ke/tao-kiem-ke-toan-bo
     */
    // [ĐÃ SỬA] Đường dẫn từ "/create-full" -> "/tao-kiem-ke-toan-bo"
    @PostMapping("/tao-kiem-ke-toan-bo")
    public ResponseEntity<Map<String, Object>> createFullInventoryCheck(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String tenKiemKe = (String) request.get("tenKiemKe");
            String nguoiTao = (String) request.get("nguoiTao");

            KiemKeKho kiemKeKho = quanLyKiemKeService.createFullInventoryCheck(tenKiemKe, nguoiTao);

            response.put("success", true);
            response.put("message", "Tạo kiểm kê toàn bộ kho thành công");
            response.put("data", kiemKeKho);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Thêm sản phẩm vào phiếu kiểm kê
     * POST /api/v1/quan-ly-kiem-ke/them-san-pham
     */
    // [ĐÃ SỬA] Đường dẫn và cấu trúc request
    @PostMapping("/them-san-pham")
    public ResponseEntity<Map<String, Object>> addProductToInventoryCheck(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer maKiemKe = (Integer) request.get("maKiemKe");
            Integer maBienThe = (Integer) request.get("maBienThe");

            boolean success = quanLyKiemKeService.addProductToInventoryCheck(maKiemKe, maBienThe);

            if (success) {
                response.put("success", true);
                response.put("message", "Thêm sản phẩm vào phiếu kiểm kê thành công");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Thêm sản phẩm thất bại - Sản phẩm đã tồn tại hoặc phiếu kiểm kê không ở trạng thái chuẩn bị");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Bắt đầu kiểm kê
     * PUT /api/v1/quan-ly-kiem-ke/bat-dau-kiem-ke/{maKiemKe}
     */
    // [ĐÃ SỬA] Phương thức POST -> PUT và đường dẫn
    @PutMapping("/bat-dau-kiem-ke/{maKiemKe}")
    public ResponseEntity<Map<String, Object>> startInventoryCheck(@PathVariable Integer maKiemKe) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean success = quanLyKiemKeService.startInventoryCheck(maKiemKe);
            if (success) {
                response.put("success", true);
                response.put("message", "Bắt đầu kiểm kê thành công");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không thể bắt đầu kiểm kê");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Cập nhật số lượng thực tế kiểm kê
     * PUT /api/v1/quan-ly-kiem-ke/cap-nhat-so-luong-thuc-te
     */
    // [ĐÃ SỬA] Đường dẫn và cấu trúc request
    @PutMapping("/cap-nhat-so-luong-thuc-te")
    public ResponseEntity<Map<String, Object>> updateActualQuantity(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer maKiemKeChiTiet = (Integer) request.get("maKiemKeChiTiet");
            Integer soLuongThucTe = (Integer) request.get("soLuongThucTe");
            String nguoiKiemKe = (String) request.get("nguoiKiemKe");
            String lyDoChenhLech = (String) request.get("lyDoChenhLech");

            boolean success = quanLyKiemKeService.updateActualQuantity(maKiemKeChiTiet, soLuongThucTe, nguoiKiemKe, lyDoChenhLech);

            if (success) {
                response.put("success", true);
                response.put("message", "Cập nhật số lượng thực tế thành công");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Cập nhật số lượng thất bại");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Hoàn thành kiểm kê và áp dụng kết quả
     * PUT /api/v1/quan-ly-kiem-ke/hoan-thanh-kiem-ke
     */
    // [ĐÃ SỬA] Phương thức POST -> PUT, đường dẫn và cấu trúc request
    @PutMapping("/hoan-thanh-kiem-ke")
    public ResponseEntity<Map<String, Object>> completeInventoryCheck(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer maKiemKe = (Integer) request.get("maKiemKe");
            String nguoiDuyet = (String) request.get("nguoiDuyet");
            Boolean applyChanges = (Boolean) request.getOrDefault("applyChanges", true);

            boolean success = quanLyKiemKeService.completeInventoryCheck(maKiemKe, nguoiDuyet, applyChanges);

            if (success) {
                String message = applyChanges ? "Hoàn thành kiểm kê và áp dụng thay đổi thành công" : "Hoàn thành kiểm kê thành công (không áp dụng thay đổi)";
                response.put("success", true);
                response.put("message", message);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Hoàn thành kiểm kê thất bại");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Hủy kiểm kê
     * PUT /api/v1/quan-ly-kiem-ke/huy-kiem-ke
     */
    // [ĐÃ SỬA] Phương thức POST -> PUT, đường dẫn và cấu trúc request
    @PutMapping("/huy-kiem-ke")
    public ResponseEntity<Map<String, Object>> cancelInventoryCheck(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer maKiemKe = (Integer) request.get("maKiemKe");
            String lyDo = (String) request.get("lyDo");

            boolean success = quanLyKiemKeService.cancelInventoryCheck(maKiemKe, lyDo);

            if (success) {
                response.put("success", true);
                response.put("message", "Hủy kiểm kê thành công");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Hủy kiểm kê thất bại");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // =================== QUERY OPERATIONS ===================

    /**
     * Lấy danh sách phiếu kiểm kê theo trạng thái
     * GET /api/v1/quan-ly-kiem-ke/kiem-ke-theo-trang-thai?trangThai=...
     */
    // [ĐÃ SỬA] Đường dẫn và kiểu tham số @PathVariable -> @RequestParam
    @GetMapping("/kiem-ke-theo-trang-thai")
    public ResponseEntity<Map<String, Object>> getInventoryChecksByStatus(@RequestParam(name = "trangThai") String trangThai) {
        Map<String, Object> response = new HashMap<>();
        try {
            KiemKeKho.TrangThaiKiemKe trangThaiEnum = KiemKeKho.TrangThaiKiemKe.valueOf(trangThai.toUpperCase());
            List<KiemKeKho> inventoryChecks = quanLyKiemKeService.getInventoryChecksByStatus(trangThaiEnum);
            
            response.put("success", true);
            response.put("data", inventoryChecks);
            response.put("count", inventoryChecks.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy danh sách phiếu kiểm kê đang hoạt động
     * GET /api/v1/quan-ly-kiem-ke/kiem-ke-dang-hoat-dong
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/kiem-ke-dang-hoat-dong")
    public ResponseEntity<Map<String, Object>> getActiveInventoryChecks() {
        // ... implementation is ok
        Map<String, Object> response = new HashMap<>();
        try {
            List<KiemKeKho> inventoryChecks = quanLyKiemKeService.getActiveInventoryChecks();
            response.put("success", true);
            response.put("data", inventoryChecks);
            response.put("count", inventoryChecks.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy chi tiết kiểm kê
     * GET /api/v1/quan-ly-kiem-ke/chi-tiet-kiem-ke/{maKiemKe}
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/chi-tiet-kiem-ke/{maKiemKe}")
    public ResponseEntity<Map<String, Object>> getInventoryCheckDetails(@PathVariable Integer maKiemKe) {
        // ... implementation is ok
        Map<String, Object> response = new HashMap<>();
        try {
            List<KiemKeChiTiet> details = quanLyKiemKeService.getInventoryCheckDetails(maKiemKe);
            response.put("success", true);
            response.put("data", details);
            response.put("count", details.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy sản phẩm có chênh lệch
     * GET /api/v1/quan-ly-kiem-ke/san-pham-chenh-lech/{maKiemKe}
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/san-pham-chenh-lech/{maKiemKe}")
    public ResponseEntity<Map<String, Object>> getProductsWithDifferences(@PathVariable Integer maKiemKe) {
        // ... implementation is ok
        Map<String, Object> response = new HashMap<>();
        try {
            List<KiemKeChiTiet> differences = quanLyKiemKeService.getProductsWithDifferences(maKiemKe);
            response.put("success", true);
            response.put("data", differences);
            response.put("count", differences.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy sản phẩm thiếu hàng
     * GET /api/v1/quan-ly-kiem-ke/san-pham-thieu/{maKiemKe}
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/san-pham-thieu/{maKiemKe}")
    public ResponseEntity<Map<String, Object>> getShortageProducts(@PathVariable Integer maKiemKe) {
        // ... implementation is ok
        Map<String, Object> response = new HashMap<>();
        try {
            List<KiemKeChiTiet> shortages = quanLyKiemKeService.getShortageProducts(maKiemKe);
            response.put("success", true);
            response.put("data", shortages);
            response.put("count", shortages.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy sản phẩm thừa hàng
     * GET /api/v1/quan-ly-kiem-ke/san-pham-thua/{maKiemKe}
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/san-pham-thua/{maKiemKe}")
    public ResponseEntity<Map<String, Object>> getSurplusProducts(@PathVariable Integer maKiemKe) {
        // ... implementation is ok
        Map<String, Object> response = new HashMap<>();
        try {
            List<KiemKeChiTiet> surplus = quanLyKiemKeService.getSurplusProducts(maKiemKe);
            response.put("success", true);
            response.put("data", surplus);
            response.put("count", surplus.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy tổng kết kiểm kê
     * GET /api/v1/quan-ly-kiem-ke/tong-ket-kiem-ke/{maKiemKe}
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/tong-ket-kiem-ke/{maKiemKe}")
    public ResponseEntity<Map<String, Object>> getInventoryCheckSummary(@PathVariable Integer maKiemKe) {
        // ... implementation is ok
        Map<String, Object> response = new HashMap<>();
        try {
            // Note: Service methods assumed to exist for this summary
            Object[] summary = quanLyKiemKeService.getInventoryCheckSummary(maKiemKe);
            response.put("success", true);
            response.put("data", summary);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Thống kê kiểm kê
     * GET /api/v1/quan-ly-kiem-ke/thong-ke-kiem-ke
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/thong-ke-kiem-ke")
    public ResponseEntity<Map<String, Object>> getInventoryCheckStatistics() {
        // ... implementation is ok
        Map<String, Object> response = new HashMap<>();
        try {
            List<Object[]> stats = quanLyKiemKeService.getInventoryCheckStatistics();
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}