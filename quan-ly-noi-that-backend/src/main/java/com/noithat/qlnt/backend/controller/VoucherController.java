package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.VoucherApplyRequest;
import com.noithat.qlnt.backend.dto.VoucherCreationRequest;
import com.noithat.qlnt.backend.entity.Voucher;
import com.noithat.qlnt.backend.service.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/voucher")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    /**
     * API Khách hàng: Lấy danh sách voucher áp dụng cho mình
     * GET /api/v1/voucher/eligible/1
     */
    @GetMapping("/eligible/{maKhachHang}")
    public ResponseEntity<List<Voucher>> getEligibleVouchers(@PathVariable Integer maKhachHang) {
        List<Voucher> vouchers = voucherService.getEligibleVouchersForCustomer(maKhachHang);
        return ResponseEntity.ok(vouchers);
    }

    /**
     * API Khách hàng: Kiểm tra và tính toán áp dụng voucher khi checkout
     * POST /api/v1/voucher/apply
     */
    @PostMapping("/apply")
    public ResponseEntity<BigDecimal> applyVoucher(@RequestBody VoucherApplyRequest request) {
        // Trả về số tiền giảm được
        try {
            BigDecimal soTienGiam = voucherService.applyVoucher(request);
            return ResponseEntity.ok(soTienGiam);
        } catch (RuntimeException e) {
            // Xử lý lỗi nghiệp vụ (ví dụ: Voucher hết hạn, không đủ điều kiện)
            return ResponseEntity.badRequest().body(null); // Có thể dùng Custom Exception Handler tốt hơn
        }
    }

    // ================== CRUD cho Nhân viên/Admin ==================

    @GetMapping
    public ResponseEntity<List<Voucher>> getAll() {
        return ResponseEntity.ok(voucherService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Voucher> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(voucherService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Voucher> create(@Valid @RequestBody VoucherCreationRequest request) {
        return ResponseEntity.ok(voucherService.createVoucher(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voucher> update(@PathVariable Integer id, @Valid @RequestBody VoucherCreationRequest request) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}