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

import com.noithat.qlnt.backend.dto.common.BoSuuTapDto;
import com.noithat.qlnt.backend.entity.BoSuuTap;
import com.noithat.qlnt.backend.entity.SanPham;
import com.noithat.qlnt.backend.service.IBoSuuTapService;

@RestController
@RequestMapping("/api/collections")
public class BoSuuTapController {

    @Autowired
    private IBoSuuTapService boSuuTapService;

    @GetMapping
    public ResponseEntity<List<BoSuuTap>> getAll() {
        return ResponseEntity.ok(boSuuTapService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoSuuTap> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(boSuuTapService.getById(id));
    }

    @PostMapping
    public ResponseEntity<BoSuuTap> create(@RequestBody BoSuuTapDto dto) {
        return new ResponseEntity<>(boSuuTapService.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoSuuTap> update(@PathVariable Integer id, @RequestBody BoSuuTapDto dto) {
        return ResponseEntity.ok(boSuuTapService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        boSuuTapService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{collectionId}/products")
    public ResponseEntity<List<SanPham>> getProductsInCollection(@PathVariable Integer collectionId) {
        return ResponseEntity.ok(boSuuTapService.getProductsInCollection(collectionId));
    }

    @PostMapping("/{collectionId}/products/{productId}")
    public ResponseEntity<Void> addProductToCollection(@PathVariable Integer collectionId, @PathVariable Integer productId) {
        boSuuTapService.addProductToCollection(collectionId, productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{collectionId}/products/{productId}")
    public ResponseEntity<Void> removeProductFromCollection(@PathVariable Integer collectionId, @PathVariable Integer productId) {
        boSuuTapService.removeProductFromCollection(collectionId, productId);
        return ResponseEntity.noContent().build();
    }
}