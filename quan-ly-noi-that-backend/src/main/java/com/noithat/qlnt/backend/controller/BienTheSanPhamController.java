package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.request.BienTheUpdateRequestDto;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.service.IBienTheSanPhamService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bien-the-san-pham")
@CrossOrigin(origins = "*")
public class BienTheSanPhamController {

    @Autowired
    private IBienTheSanPhamService bienTheSanPhamService;

    /**
     * Lấy tất cả biến thể sản phẩm với phân trang
     */
    @GetMapping
    public ResponseEntity<Page<BienTheSanPham>> getAllBienTheSanPham(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "maBienThe") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<BienTheSanPham> bienTheList = bienTheSanPhamService.getAllBienTheSanPham(pageable);
        return ResponseEntity.ok(bienTheList);
    }

    /**
     * Lấy biến thể sản phẩm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<BienTheSanPham> getBienTheSanPhamById(@PathVariable Integer id) {
        BienTheSanPham bienThe = bienTheSanPhamService.getBienTheSanPhamById(id);
        return ResponseEntity.ok(bienThe);
    }

    /**
     * Lấy danh sách biến thể theo mã sản phẩm
     */
    @GetMapping("/san-pham/{maSanPham}")
    public ResponseEntity<List<BienTheSanPham>> getBienTheBySanPhamId(@PathVariable Integer maSanPham) {
        List<BienTheSanPham> bienTheList = bienTheSanPhamService.getBienTheBySanPhamId(maSanPham);
        return ResponseEntity.ok(bienTheList);
    }

    /**
     * Tạo mới biến thể sản phẩm
     */
    @PostMapping("/san-pham/{maSanPham}")
    public ResponseEntity<BienTheSanPham> createBienTheSanPham(
            @PathVariable Integer maSanPham,
            @Valid @RequestBody BienTheRequestDto request) {
        
        BienTheSanPham newBienThe = bienTheSanPhamService.createBienTheSanPham(maSanPham, request);
        return new ResponseEntity<>(newBienThe, HttpStatus.CREATED);
    }

    /**
     * Cập nhật biến thể sản phẩm
     */
    @PutMapping("/{id}")
    public ResponseEntity<BienTheSanPham> updateBienTheSanPham(
            @PathVariable Integer id,
            @Valid @RequestBody BienTheUpdateRequestDto request) {
        
        BienTheSanPham updatedBienThe = bienTheSanPhamService.updateBienTheSanPham(id, request);
        return ResponseEntity.ok(updatedBienThe);
    }

    /**
     * Xóa biến thể sản phẩm
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBienTheSanPham(@PathVariable Integer id) {
        bienTheSanPhamService.deleteBienTheSanPham(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Cập nhật số lượng tồn kho
     */
    @PatchMapping("/{id}/so-luong-ton")
    public ResponseEntity<BienTheSanPham> updateSoLuongTon(
            @PathVariable Integer id,
            @RequestParam Integer soLuong) {
        
        BienTheSanPham updatedBienThe = bienTheSanPhamService.updateSoLuongTon(id, soLuong);
        return ResponseEntity.ok(updatedBienThe);
    }

    /**
     * Kiểm tra tồn kho
     */
    @GetMapping("/{id}/kiem-tra-ton-kho")
    public ResponseEntity<Boolean> checkTonKho(
            @PathVariable Integer id,
            @RequestParam Integer soLuong) {
        
        boolean coTonKho = bienTheSanPhamService.checkTonKho(id, soLuong);
        return ResponseEntity.ok(coTonKho);
    }

    /**
     * Tìm biến thể theo SKU
     */
    @GetMapping("/sku/{sku}")
    public ResponseEntity<BienTheSanPham> getBienTheBySku(@PathVariable String sku) {
        BienTheSanPham bienThe = bienTheSanPhamService.findBySku(sku);
        return ResponseEntity.ok(bienThe);
    }

    /**
     * Lấy thông tin chi tiết biến thể sản phẩm
     */
    @GetMapping("/{id}/chi-tiet")
    public ResponseEntity<com.noithat.qlnt.backend.dto.response.BienTheSanPhamDetailResponse> getBienTheSanPhamDetail(
            @PathVariable Integer id) {
        com.noithat.qlnt.backend.dto.response.BienTheSanPhamDetailResponse detail = 
                bienTheSanPhamService.getBienTheSanPhamDetail(id);
        return ResponseEntity.ok(detail);
    }
}