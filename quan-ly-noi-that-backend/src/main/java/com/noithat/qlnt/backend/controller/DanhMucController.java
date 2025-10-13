package com.noithat.qlnt.backend.controller;

import java.util.Set;

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

import com.noithat.qlnt.backend.dto.DanhMucDto;
import com.noithat.qlnt.backend.entity.DanhMuc;
import com.noithat.qlnt.backend.service.DanhMucService;

@RestController
@RequestMapping("/api/categories")
public class DanhMucController {

    @Autowired
    private DanhMucService danhMucService;

    @PostMapping
    public ResponseEntity<DanhMuc> createDanhMuc(@RequestBody DanhMucDto dto) {
        DanhMuc newCategory = danhMucService.createDanhMuc(dto);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<Set<DanhMuc>> getChildren(@PathVariable Integer id) {
        return ResponseEntity.ok(danhMucService.getChildren(id));
    }

    @GetMapping("/{id}/parents")
    public ResponseEntity<Set<DanhMuc>> getParents(@PathVariable Integer id) {
        return ResponseEntity.ok(danhMucService.getParents(id));
    }
    @PutMapping("/{id}")
    public ResponseEntity<DanhMuc> updateDanhMuc(@PathVariable Integer id, @RequestBody DanhMucDto dto) {
        DanhMuc updatedCategory = danhMucService.updateDanhMuc(id, dto);
        return ResponseEntity.ok(updatedCategory);
    }
    @PostMapping("/{childId}/parents/{parentId}")
    public ResponseEntity<Void> linkParentToChild(@PathVariable Integer childId, @PathVariable Integer parentId) {
        danhMucService.linkParentToChild(childId, parentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{childId}/parents/{parentId}")
    public ResponseEntity<Void> unlinkParentFromChild(@PathVariable Integer childId, @PathVariable Integer parentId) {
        danhMucService.unlinkParentFromChild(childId, parentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDanhMuc(@PathVariable Integer id) {
        danhMucService.deleteDanhMuc(id);
        return ResponseEntity.noContent().build();
    }
}