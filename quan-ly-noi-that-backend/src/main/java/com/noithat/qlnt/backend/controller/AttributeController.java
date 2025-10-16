package com.noithat.qlnt.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.noithat.qlnt.backend.dto.common.ThuocTinhDto;
import com.noithat.qlnt.backend.entity.ThuocTinh;
import com.noithat.qlnt.backend.service.IAttributeService;

@RestController
@RequestMapping("/api/attributes")
public class AttributeController {
    @Autowired private IAttributeService attributeService;

    // ===== Thuộc tính (Attribute) =====
    @PostMapping
    public ResponseEntity<ThuocTinh> createThuocTinh(@Valid @RequestBody ThuocTinhDto dto) {
        return new ResponseEntity<>(attributeService.createThuocTinh(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ThuocTinh>> getAllThuocTinh() {
        return ResponseEntity.ok(attributeService.getAllThuocTinh());
    }

    // ----- ENDPOINT MỚI -----
    @PutMapping("/{id}")
    public ResponseEntity<ThuocTinh> updateThuocTinh(@PathVariable Integer id, @RequestBody ThuocTinhDto dto) {
        return ResponseEntity.ok(attributeService.updateThuocTinh(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteThuocTinh(@PathVariable Integer id) {
        attributeService.deleteThuocTinh(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/values/{id}")
    public ResponseEntity<Void> deleteGiaTri(@PathVariable Integer id) {
        attributeService.deleteGiaTriThuocTinh(id);
        return ResponseEntity.noContent().build();
    }
}