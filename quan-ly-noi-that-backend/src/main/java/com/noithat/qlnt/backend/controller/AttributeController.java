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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.noithat.qlnt.backend.dto.GiaTriThuocTinhDto;
import com.noithat.qlnt.backend.dto.ThuocTinhDto;
import com.noithat.qlnt.backend.entity.GiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.ThuocTinh;
import com.noithat.qlnt.backend.service.AttributeService;

@RestController
@RequestMapping("/api/attributes")
public class AttributeController {
    @Autowired private AttributeService attributeService;

    // ===== Thuộc tính (Attribute) =====
    @PostMapping
    public ResponseEntity<ThuocTinh> createThuocTinh(@RequestBody ThuocTinhDto dto) {
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


    // ===== Giá trị thuộc tính (Attribute Value) =====
    @PostMapping("/{thuocTinhId}/values")
    public ResponseEntity<GiaTriThuocTinh> createGiaTri(@PathVariable Integer thuocTinhId, @RequestBody GiaTriThuocTinhDto dto) {
        return new ResponseEntity<>(attributeService.createGiaTri(thuocTinhId, dto), HttpStatus.CREATED);
    }

    @GetMapping("/{thuocTinhId}/values")
    public ResponseEntity<List<GiaTriThuocTinh>> getGiaTri(@PathVariable Integer thuocTinhId) {
        return ResponseEntity.ok(attributeService.getGiaTriByThuocTinh(thuocTinhId));
    }

    // ----- ENDPOINT MỚI -----
    @PutMapping("/values/{id}")
    public ResponseEntity<GiaTriThuocTinh> updateGiaTri(@PathVariable Integer id, @RequestBody GiaTriThuocTinhDto dto) {
        return ResponseEntity.ok(attributeService.updateGiaTriThuocTinh(id, dto));
    }

    @DeleteMapping("/values/{id}")
    public ResponseEntity<Void> deleteGiaTri(@PathVariable Integer id) {
        attributeService.deleteGiaTriThuocTinh(id);
        return ResponseEntity.noContent().build();
    }
}