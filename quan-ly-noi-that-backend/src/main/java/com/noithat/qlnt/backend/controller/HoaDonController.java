package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.UpdateHoaDonRequest;
import com.noithat.qlnt.backend.dto.response.HoaDonChiTietResponse;
import com.noithat.qlnt.backend.dto.response.HoaDonResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeHoaDonResponse;
import com.noithat.qlnt.backend.service.HoaDonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoadon")
@RequiredArgsConstructor
public class HoaDonController {

    private final HoaDonService hoaDonService;

    @GetMapping("/thongke")
    public ResponseEntity<ThongKeHoaDonResponse> getThongKe() {
        return ResponseEntity.ok(hoaDonService.getThongKe());
    }

    @GetMapping
    public ResponseEntity<List<HoaDonResponse>> getAllHoaDon(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(hoaDonService.getAllHoaDon(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoaDonChiTietResponse> getHoaDonById(@PathVariable Integer id) {
        return ResponseEntity.ok(hoaDonService.getHoaDonById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HoaDonResponse> updateHoaDon(@PathVariable Integer id, @Valid @RequestBody UpdateHoaDonRequest request) {
        return ResponseEntity.ok(hoaDonService.updateHoaDon(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoaDon(@PathVariable Integer id) {
        hoaDonService.deleteHoaDon(id);
        return ResponseEntity.noContent().build();
    }
}