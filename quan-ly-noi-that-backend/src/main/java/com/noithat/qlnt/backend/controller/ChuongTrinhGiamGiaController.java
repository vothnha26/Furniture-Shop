package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.*;
import com.noithat.qlnt.backend.dto.request.ChuongTrinhGiamGiaRequest;
import com.noithat.qlnt.backend.entity.ChuongTrinhGiamGia;
import com.noithat.qlnt.backend.service.ChuongTrinhGiamGiaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controller quản lý Chương trình Giảm giá trực tiếp trên Biến thể Sản phẩm
 */
@RestController
@RequestMapping("/api/v1/chuong-trinh-giam-gia")
public class ChuongTrinhGiamGiaController {

    private final ChuongTrinhGiamGiaService service;

    public ChuongTrinhGiamGiaController(ChuongTrinhGiamGiaService service) {
        this.service = service;
    }

    /**
     * Lấy danh sách tất cả chương trình giảm giá (cơ bản)
     */
    @GetMapping
    public ResponseEntity<List<ChuongTrinhGiamGia>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * Lấy danh sách tất cả chương trình giảm giá (chi tiết)
     */
    @GetMapping("/details")
    public ResponseEntity<List<ChuongTrinhGiamGiaResponse>> getAllWithDetails() {
        return ResponseEntity.ok(service.getAllWithDetails());
    }

    /**
     * Lấy thông tin cơ bản chương trình giảm giá
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChuongTrinhGiamGia> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /**
     * Lấy thông tin chi tiết chương trình giảm giá kèm danh sách biến thể
     */
    @GetMapping("/{id}/details")
    public ResponseEntity<ChuongTrinhGiamGiaResponse> getDetailById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getDetailById(id));
    }

    /**
     * Tạo chương trình giảm giá đơn giản (không kèm biến thể)
     */
    @PostMapping
    public ResponseEntity<ChuongTrinhGiamGia> create(@Valid @RequestBody ChuongTrinhGiamGiaRequest request) {
        return ResponseEntity.ok(service.create(request.getTen(), request.getNgayBatDau(), request.getNgayKetThuc()));
    }

    /**
     * Tạo chương trình giảm giá kèm danh sách biến thể
     */
    @PostMapping("/with-details")
    public ResponseEntity<ChuongTrinhGiamGiaResponse> createWithDetails(
            @Valid @RequestBody ChuongTrinhGiamGiaDetailRequest request) {
        return ResponseEntity.ok(service.createWithDetails(request));
    }

    /**
     * Cập nhật chương trình giảm giá đơn giản
     */
    @PutMapping("/{id}")
    public ResponseEntity<ChuongTrinhGiamGia> update(@PathVariable Integer id,
                                                    @Valid @RequestBody ChuongTrinhGiamGiaRequest request) {
        return ResponseEntity.ok(service.update(id, request.getTen(), request.getNgayBatDau(), request.getNgayKetThuc()));
    }

    /**
     * Cập nhật chương trình giảm giá kèm danh sách biến thể
     */
    @PutMapping("/{id}/with-details")
    public ResponseEntity<ChuongTrinhGiamGiaResponse> updateWithDetails(
            @PathVariable Integer id,
            @Valid @RequestBody ChuongTrinhGiamGiaDetailRequest request) {
        return ResponseEntity.ok(service.updateWithDetails(id, request));
    }

    /**
     * Xóa chương trình giảm giá
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Quản lý giá sau giảm cho từng biến thể ==========

    /**
     * Thêm hoặc cập nhật giá sau giảm cho một biến thể trong chương trình
     */
    @PostMapping("/{maChuongTrinh}/bien-the/{maBienThe}")
    public ResponseEntity<Void> upsertBienTheGia(@PathVariable Integer maChuongTrinh,
                                                 @PathVariable Integer maBienThe,
                                                 @RequestParam BigDecimal giaSauGiam) {
        service.upsertBienTheGia(maChuongTrinh, maBienThe, giaSauGiam);
        return ResponseEntity.ok().build();
    }

    /**
     * Xóa biến thể khỏi chương trình giảm giá
     */
    @DeleteMapping("/{maChuongTrinh}/bien-the/{maBienThe}")
    public ResponseEntity<Void> removeBienTheGia(@PathVariable Integer maChuongTrinh,
                                                 @PathVariable Integer maBienThe) {
        service.removeBienTheGia(maChuongTrinh, maBienThe);
        return ResponseEntity.noContent().build();
    }

    // ========== API cho Khách hàng xem giá ==========

    /**
     * Lấy giá hiển thị hiện tại cho một biến thể (giá thấp nhất)
     */
    @GetMapping("/bien-the/{maBienThe}/gia-hien-thi")
    public ResponseEntity<BigDecimal> getGiaHienThi(@PathVariable Integer maBienThe) {
        return ResponseEntity.ok(service.getGiaHienThi(maBienThe));
    }

    /**
     * Lấy thông tin chi tiết giá của biến thể với các chương trình giảm giá đang áp dụng
     */
    @GetMapping("/bien-the/{maBienThe}/gia-chi-tiet")
    public ResponseEntity<BienTheSanPhamGiaResponse> getBienTheGiaChiTiet(@PathVariable Integer maBienThe) {
        return ResponseEntity.ok(service.getBienTheGiaChiTiet(maBienThe));
    }
}


