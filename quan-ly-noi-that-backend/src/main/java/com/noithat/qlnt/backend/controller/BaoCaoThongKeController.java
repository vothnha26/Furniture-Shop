package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.service.QuanLyTonKhoService;
import com.noithat.qlnt.backend.service.QuanLyTrangThaiDonHangService;
import com.noithat.qlnt.backend.service.QuanLyKiemKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bao-cao-thong-ke")
public class BaoCaoThongKeController {

    @Autowired
    private QuanLyTonKhoService quanLyTonKhoService;

    @Autowired
    private QuanLyTrangThaiDonHangService quanLyTrangThaiDonHangService;

    @Autowired
    private QuanLyKiemKeService quanLyKiemKeService;
    
    /**
     * Lấy dữ liệu tổng quan cho Dashboard
     * GET /api/v1/bao-cao-thong-ke/tong-quan-dashboard
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/tong-quan-dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Thống kê tồn kho
            Double totalStockValue = quanLyTonKhoService.getTotalStockValue();
            List<BienTheSanPham> lowStockProducts = quanLyTonKhoService.getLowStockProducts();
            List<BienTheSanPham> outOfStockProducts = quanLyTonKhoService.getOutOfStockProducts();

            // Thống kê đơn hàng
            var pendingOrders = quanLyTrangThaiDonHangService.getPendingOrders();
            var shippingOrders = quanLyTrangThaiDonHangService.getShippingOrders();

            // Thống kê kiểm kê
            var activeInventoryChecks = quanLyKiemKeService.getActiveInventoryChecks();

            // Tạo dashboard data
            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("tongGiaTriTonKho", totalStockValue != null ? totalStockValue : 0.0);
            dashboard.put("soLuongSanPhamSapHet", lowStockProducts.size());
            dashboard.put("soLuongSanPhamHetHang", outOfStockProducts.size());
            dashboard.put("soDonHangChoXuLy", pendingOrders.size());
            dashboard.put("soDonHangDangGiao", shippingOrders.size());
            dashboard.put("soKiemKeDangThucHien", activeInventoryChecks.size());
            dashboard.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            response.put("success", true);
            response.put("data", dashboard);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Báo cáo tồn kho
     * GET /api/v1/bao-cao-thong-ke/bao-cao-ton-kho
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/bao-cao-ton-kho")
    public ResponseEntity<Map<String, Object>> getStockReportSummary() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Object[]> productSummary = quanLyTonKhoService.getStockSummaryByProduct();
            List<Object[]> categorySummary = quanLyTonKhoService.getStockSummaryByCategory();
            Double totalValue = quanLyTonKhoService.getTotalStockValue();

            Map<String, Object> report = new HashMap<>();
            report.put("tongKetTheoSanPham", productSummary);
            report.put("tongKetTheoDanhMuc", categorySummary);
            report.put("tongGiaTriTonKho", totalValue);
            report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            response.put("success", true);
            response.put("data", report);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Cảnh báo tồn kho
     * GET /api/v1/bao-cao-thong-ke/canh-bao-ton-kho
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/canh-bao-ton-kho")
    public ResponseEntity<Map<String, Object>> getStockAlerts() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BienTheSanPham> lowStockProducts = quanLyTonKhoService.getLowStockProducts();
            List<BienTheSanPham> outOfStockProducts = quanLyTonKhoService.getOutOfStockProducts();

            Map<String, Object> alerts = new HashMap<>();
            alerts.put("sanPhamSapHet", lowStockProducts);
            alerts.put("sanPhamHetHang", outOfStockProducts);
            alerts.put("soLuongSapHet", lowStockProducts.size());
            alerts.put("soLuongHetHang", outOfStockProducts.size());
            alerts.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            response.put("success", true);
            response.put("data", alerts);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Tổng kết trạng thái đơn hàng
     * GET /api/v1/bao-cao-thong-ke/tong-ket-trang-thai-don-hang
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/tong-ket-trang-thai-don-hang")
    public ResponseEntity<Map<String, Object>> getOrderStatusSummary() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Giả sử service có một phương thức để lấy số lượng theo từng trạng thái
            Map<String, Long> statusCounts = quanLyTrangThaiDonHangService.countOrdersByStatus();

            Map<String, Object> summary = new HashMap<>();
            summary.put("thongKeTrangThai", statusCounts);
            summary.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

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
     * Báo cáo hiệu suất xử lý đơn hàng
     * GET /api/v1/bao-cao-thong-ke/hieu-suat-xu-ly-don-hang
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/hieu-suat-xu-ly-don-hang")
    public ResponseEntity<Map<String, Object>> getOrderProcessingPerformance() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Object[]> processingStats = quanLyTrangThaiDonHangService.getProcessingTimeStats();
            
            Map<String, Object> report = new HashMap<>();
            report.put("thongKeThoiGianXuLy", processingStats);
            report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            response.put("success", true);
            response.put("data", report);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * Báo cáo kiểm kê
     * GET /api/v1/bao-cao-thong-ke/bao-cao-kiem-ke
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/bao-cao-kiem-ke")
    public ResponseEntity<Map<String, Object>> getInventoryReportSummary() {
        Map<String, Object> response = new HashMap<>();
        try {
            var activeChecks = quanLyKiemKeService.getActiveInventoryChecks();
            var inventoryStats = quanLyKiemKeService.getInventoryCheckStatistics();
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("soKiemKeDangThucHien", activeChecks.size());
            summary.put("thongKeChung", inventoryStats);
            summary.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
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
     * Cảnh báo hệ thống
     * GET /api/v1/bao-cao-thong-ke/canh-bao-he-thong
     */
    // [ĐÃ SỬA] Đường dẫn
    @GetMapping("/canh-bao-he-thong")
    public ResponseEntity<Map<String, Object>> getSystemAlerts() {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> healthCheck = new HashMap<>();

            boolean hasLowStock = !quanLyTonKhoService.getLowStockProducts().isEmpty();
            boolean hasOutOfStock = !quanLyTonKhoService.getOutOfStockProducts().isEmpty();
            boolean hasPendingOrders = !quanLyTrangThaiDonHangService.getPendingOrders().isEmpty();

            String systemStatus;
            if (hasOutOfStock) {
                systemStatus = "CRITICAL"; // Có sản phẩm hết hàng
            } else if (hasLowStock || hasPendingOrders) {
                systemStatus = "WARNING"; // Có cảnh báo
            } else {
                systemStatus = "HEALTHY"; // Tất cả bình thường
            }
            
            healthCheck.put("trangThaiHeThong", systemStatus);
            healthCheck.put("cacCanhBao", Map.of(
                "coSanPhamSapHetHang", hasLowStock,
                "coSanPhamHetHang", hasOutOfStock,
                "coDonHangChoXuLy", hasPendingOrders
            ));
            healthCheck.put("checkedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            response.put("success", true);
            response.put("data", healthCheck);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}