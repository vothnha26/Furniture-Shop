package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.request.SanPhamRequestDto;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.SanPham;
import com.noithat.qlnt.backend.service.IProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private IProductService productService;

    // ===== CRUD cho Sản phẩm (Sản phẩm gốc) =====
    @GetMapping
    public ResponseEntity<List<SanPham>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SanPham> getProductById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<SanPham> createSanPham(@Valid @RequestBody SanPhamRequestDto dto) {
        return new ResponseEntity<>(productService.createSanPham(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SanPham> updateSanPham(@PathVariable Integer id, @Valid @RequestBody SanPhamRequestDto dto) {
        return ResponseEntity.ok(productService.updateSanPham(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSanPham(@PathVariable Integer id) {
        productService.deleteSanPham(id);
        return ResponseEntity.noContent().build();
    }

    // ===== Chức năng tạo Biến thể cho sản phẩm =====
    @PostMapping("/{productId}/variants")
    public ResponseEntity<BienTheSanPham> createBienThe(@PathVariable Integer productId, @RequestBody BienTheRequestDto dto) {
        return new ResponseEntity<>(productService.createBienThe(productId, dto), HttpStatus.CREATED);
    }

    // ===== Chức năng gán Sản phẩm vào Danh mục =====
    @PostMapping("/{productId}/categories/{categoryId}")
    public ResponseEntity<Void> addProductToCategory(@PathVariable Integer productId, @PathVariable Integer categoryId) {
        productService.addProductToCategory(productId, categoryId);
        return ResponseEntity.ok().build();
    }
}