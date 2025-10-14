package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.entity.KiemKeKho;
import com.noithat.qlnt.backend.entity.KiemKeChiTiet;
import com.noithat.qlnt.backend.service.IQuanLyKiemKeService;
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
    private IQuanLyKiemKeService quanLyKiemKeService;

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
            // 🔹 Validation: Check for required fields
            if (!request.containsKey("maKiemKe")) {
                response.put("success", false);
                response.put("message", "Thiếu trường bắt buộc: maKiemKe");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!request.containsKey("maBienThe")) {
                response.put("success", false);
                response.put("message", "Thiếu trường bắt buộc: maBienThe");
                return ResponseEntity.badRequest().body(response);
            }
            
            Integer maKiemKe = parseInteger(request.get("maKiemKe"));
            Integer maBienThe = parseInteger(request.get("maBienThe"));
            
            // 🔹 Validation: Check parsed values
            if (maKiemKe == null) {
                response.put("success", false);
                response.put("message", "Giá trị maKiemKe không hợp lệ");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (maBienThe == null) {
                response.put("success", false);
                response.put("message", "Giá trị maBienThe không hợp lệ");
                return ResponseEntity.badRequest().body(response);
            }

            boolean success = quanLyKiemKeService.addProductToInventoryCheck(maKiemKe, maBienThe);

            if (success) {
                response.put("success", true);
                response.put("message", "Thêm sản phẩm vào phiếu kiểm kê thành công");
                return ResponseEntity.ok(response);
            } else {
                // Kiểm tra chi tiết lỗi để trả về message rõ ràng hơn
                response.put("success", false);
                response.put("message", "Thêm sản phẩm thất bại. Vui lòng kiểm tra: " +
                    "1) Phiếu kiểm kê có tồn tại không, " +
                    "2) Biến thể sản phẩm có tồn tại không, " +
                    "3) Phiếu kiểm kê có đang ở trạng thái 'DANG_CHUAN_BI' không, " +
                    "4) Sản phẩm đã được thêm vào phiếu kiểm kê này chưa");
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
            // 🔹 Validation: Check for required fields
            if (!request.containsKey("maKiemKeChiTiet")) {
                response.put("success", false);
                response.put("message", "Thiếu trường bắt buộc: maKiemKeChiTiet");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!request.containsKey("soLuongThucTe")) {
                response.put("success", false);
                response.put("message", "Thiếu trường bắt buộc: soLuongThucTe");
                return ResponseEntity.badRequest().body(response);
            }
            
            Integer maKiemKeChiTiet = parseInteger(request.get("maKiemKeChiTiet"));
            Integer soLuongThucTe = parseInteger(request.get("soLuongThucTe"));
            
            // 🔹 Validation: Check parsed values
            if (maKiemKeChiTiet == null) {
                response.put("success", false);
                response.put("message", "Giá trị maKiemKeChiTiet không hợp lệ");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (soLuongThucTe == null) {
                response.put("success", false);
                response.put("message", "Giá trị soLuongThucTe không hợp lệ");
                return ResponseEntity.badRequest().body(response);
            }
            
            String nguoiKiemKe = request.get("nguoiKiemKe") != null ? request.get("nguoiKiemKe").toString() : null;
            String lyDoChenhLech = request.get("lyDoChenhLech") != null ? request.get("lyDoChenhLech").toString() : null;

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

    // Backwards-compatible: accept POST or PUT at /cap-nhat-so-luong
    @RequestMapping(value = "/cap-nhat-so-luong", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Map<String, Object>> updateActualQuantityAlias(@RequestBody Map<String, Object> request) {
        return updateActualQuantity(request);
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
            Integer maKiemKe = parseInteger(request.get("maKiemKe"));
            String nguoiDuyet = request.get("nguoiDuyet") != null ? request.get("nguoiDuyet").toString() : null;
            Boolean applyChanges = parseBoolean(request.getOrDefault("applyChanges", Boolean.TRUE));

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

    // Backwards-compatible: accept POST/PUT at /hoan-thanh (legacy path used by some clients)
    @RequestMapping(value = "/hoan-thanh", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Map<String, Object>> completeInventoryCheckAlias(@RequestBody Map<String, Object> request) {
        return completeInventoryCheck(request);
    }

    // Helper: robustly parse integer-like values from request maps (Number or String)
    private Integer parseInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Number) return ((Number) value).intValue();
        try {
            return Integer.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // Helper: robustly parse boolean-like values
    private Boolean parseBoolean(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean) return (Boolean) value;
        String s = value.toString().trim().toLowerCase();
        if (s.equals("true") || s.equals("1") || s.equals("yes")) return Boolean.TRUE;
        if (s.equals("false") || s.equals("0") || s.equals("no")) return Boolean.FALSE;
        return null;
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

    // Backwards-compatible: /danh-sach -> list active inventory checks
    @GetMapping("/danh-sach")
    public ResponseEntity<Map<String, Object>> getInventoryListAlias() {
        return getActiveInventoryChecks();
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

    // Backwards-compatible: /chi-tiet/{maKiemKe}
    @GetMapping("/chi-tiet/{maKiemKe}")
    public ResponseEntity<Map<String, Object>> getInventoryCheckDetailsAlias(@PathVariable Integer maKiemKe) {
        return getInventoryCheckDetails(maKiemKe);
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