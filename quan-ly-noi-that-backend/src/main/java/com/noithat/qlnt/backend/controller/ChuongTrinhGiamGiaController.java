package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.ChuongTrinhGiamGiaRequest;
import com.noithat.qlnt.backend.entity.ChuongTrinhGiamGia;
import com.noithat.qlnt.backend.service.ChuongTrinhGiamGiaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/chuong-trinh-giam-gia")
public class ChuongTrinhGiamGiaController {

    private final ChuongTrinhGiamGiaService service;

    public ChuongTrinhGiamGiaController(ChuongTrinhGiamGiaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ChuongTrinhGiamGia>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChuongTrinhGiamGia> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ChuongTrinhGiamGia> create(@Valid @RequestBody ChuongTrinhGiamGiaRequest request) {
        return ResponseEntity.ok(service.create(request.getTen(), request.getNgayBatDau(), request.getNgayKetThuc()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChuongTrinhGiamGia> update(@PathVariable Integer id,
                                                    @Valid @RequestBody ChuongTrinhGiamGiaRequest request) {
        return ResponseEntity.ok(service.update(id, request.getTen(), request.getNgayBatDau(), request.getNgayKetThuc()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Quản lý giá sau giảm cho biến thể trong chương trình
    @PostMapping("/{maChuongTrinh}/bien-the/{maBienThe}")
    public ResponseEntity<Void> upsertBienTheGia(@PathVariable Integer maChuongTrinh,
                                                 @PathVariable Integer maBienThe,
                                                 @RequestParam BigDecimal giaSauGiam) {
        service.upsertBienTheGia(maChuongTrinh, maBienThe, giaSauGiam);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{maChuongTrinh}/bien-the/{maBienThe}")
    public ResponseEntity<Void> removeBienTheGia(@PathVariable Integer maChuongTrinh,
                                                 @PathVariable Integer maBienThe) {
        service.removeBienTheGia(maChuongTrinh, maBienThe);
        return ResponseEntity.noContent().build();
    }

    // Lấy giá hiển thị hiện tại cho một biến thể
    @GetMapping("/bien-the/{maBienThe}/gia-hien-thi")
    public ResponseEntity<BigDecimal> getGiaHienThi(@PathVariable Integer maBienThe) {
        return ResponseEntity.ok(service.getGiaHienThi(maBienThe));
    }
}


