package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.BienTheGiamGiaRequest;
import com.noithat.qlnt.backend.dto.BienTheGiamGiaResponse;
import com.noithat.qlnt.backend.entity.BienTheGiamGia;
import com.noithat.qlnt.backend.service.BienTheGiamGiaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bien-the-giam-gia")
@CrossOrigin(origins = "*")
public class BienTheGiamGiaController {

    @Autowired
    private BienTheGiamGiaService bienTheGiamGiaService;

    /**
     * Lấy tất cả biến thể giảm giá với phân trang
     */
    @GetMapping
    public ResponseEntity<Page<BienTheGiamGia>> getAllBienTheGiamGia(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id.maChuongTrinhGiamGia") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<BienTheGiamGia> bienTheGiamGiaList = bienTheGiamGiaService.getAllBienTheGiamGia(pageable);
        return ResponseEntity.ok(bienTheGiamGiaList);
    }

    /**
     * Lấy biến thể giảm giá theo chương trình giảm giá
     */
    @GetMapping("/chuong-trinh/{maChuongTrinh}")
    public ResponseEntity<List<BienTheGiamGiaResponse>> getBienTheGiamGiaByChuongTrinh(
            @PathVariable Integer maChuongTrinh) {
        
        List<BienTheGiamGiaResponse> bienTheGiamGiaList = 
                bienTheGiamGiaService.getBienTheGiamGiaByChuongTrinh(maChuongTrinh);
        return ResponseEntity.ok(bienTheGiamGiaList);
    }

    /**
     * Lấy biến thể giảm giá theo biến thể sản phẩm
     */
    @GetMapping("/bien-the/{maBienThe}")
    public ResponseEntity<List<BienTheGiamGiaResponse>> getBienTheGiamGiaByBienThe(
            @PathVariable Integer maBienThe) {
        
        List<BienTheGiamGiaResponse> bienTheGiamGiaList = 
                bienTheGiamGiaService.getBienTheGiamGiaByBienThe(maBienThe);
        return ResponseEntity.ok(bienTheGiamGiaList);
    }

    /**
     * Thêm biến thể vào chương trình giảm giá
     */
    @PostMapping("/chuong-trinh/{maChuongTrinh}")
    public ResponseEntity<BienTheGiamGiaResponse> addBienTheToGiamGia(
            @PathVariable Integer maChuongTrinh,
            @Valid @RequestBody BienTheGiamGiaRequest request) {
        
        BienTheGiamGiaResponse response = bienTheGiamGiaService.addBienTheToGiamGia(maChuongTrinh, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Cập nhật giá sau giảm
     */
    @PutMapping("/chuong-trinh/{maChuongTrinh}/bien-the/{maBienThe}")
    public ResponseEntity<BienTheGiamGiaResponse> updateGiaSauGiam(
            @PathVariable Integer maChuongTrinh,
            @PathVariable Integer maBienThe,
            @RequestParam BigDecimal giaSauGiam) {
        
        BienTheGiamGiaResponse response = bienTheGiamGiaService.updateGiaSauGiam(
                maChuongTrinh, maBienThe, giaSauGiam);
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa biến thể khỏi chương trình giảm giá
     */
    @DeleteMapping("/chuong-trinh/{maChuongTrinh}/bien-the/{maBienThe}")
    public ResponseEntity<Void> removeBienTheFromGiamGia(
            @PathVariable Integer maChuongTrinh,
            @PathVariable Integer maBienThe) {
        
        bienTheGiamGiaService.removeBienTheFromGiamGia(maChuongTrinh, maBienThe);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy giá tốt nhất của một biến thể
     */
    @GetMapping("/gia-tot-nhat/{maBienThe}")
    public ResponseEntity<BigDecimal> getBestPriceForBienThe(@PathVariable Integer maBienThe) {
        BigDecimal bestPrice = bienTheGiamGiaService.getBestPriceForBienThe(maBienThe);
        return ResponseEntity.ok(bestPrice);
    }
}