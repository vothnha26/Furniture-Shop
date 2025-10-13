package com.noithat.qlnt.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.noithat.qlnt.backend.dto.BienTheUpdateRequestDto;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.service.VariantService;

@RestController
@RequestMapping("/api/variants")
public class VariantController {

    @Autowired
    private VariantService variantService;

    // Lấy tất cả biến thể của một sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<BienTheSanPham>> getVariantsByProduct(@PathVariable Integer productId) {
        return ResponseEntity.ok(variantService.getVariantsByProductId(productId));
    }

    // Lấy thông tin chi tiết một biến thể
    @GetMapping("/{id}")
    public ResponseEntity<BienTheSanPham> getVariantById(@PathVariable Integer id) {
        return ResponseEntity.ok(variantService.getVariantById(id));
    }

    // Cập nhật một biến thể
    @PutMapping("/{id}")
    public ResponseEntity<BienTheSanPham> updateVariant(@PathVariable Integer id, @RequestBody BienTheUpdateRequestDto dto) {
        return ResponseEntity.ok(variantService.updateVariant(id, dto));
    }

    // Xóa một biến thể
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Integer id) {
        variantService.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }
}