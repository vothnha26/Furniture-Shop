package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.DonHangRequest;
import com.noithat.qlnt.backend.dto.response.DonHangResponse;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.service.IDonHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminOrderController {

    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final IDonHangService donHangService;

    // Search variants by SKU or product name
    @GetMapping("/san-pham/search")
    public ResponseEntity<List<Map<String, Object>>> searchVariants(@RequestParam("q") String q) {
        List<BienTheSanPham> list = bienTheSanPhamRepository.searchBySkuOrProductName(q);
        List<Map<String, Object>> out = list.stream().map(b -> {
            return Map.of(
                    "maBienThe", b.getMaBienThe(),
                    "sku", b.getSku(),
                    "tenSanPham", b.getSanPham() != null ? b.getSanPham().getTenSanPham() : null,
                    "giaBan", b.getGiaBan(),
                    "soLuongTon", b.getSoLuongTon(),
                    "attributes", b.getGiaTriThuocTinhs() // helper method returns list of attribute values
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    // Admin creates order/invoice (minimal wrapper around existing service)
    @PostMapping("/don-hang")
    public ResponseEntity<DonHangResponse> createOrderAsAdmin(@RequestBody DonHangRequest request) {
        DonHangResponse resp = donHangService.taoDonHang(request);
        return ResponseEntity.ok(resp);
    }
}
