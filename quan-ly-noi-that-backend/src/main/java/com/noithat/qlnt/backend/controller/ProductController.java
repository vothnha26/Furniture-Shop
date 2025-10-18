package com.noithat.qlnt.backend.controller;

import com.noithat.qlnt.backend.dto.request.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.request.SanPhamRequestDto;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.SanPham;
import com.noithat.qlnt.backend.service.IProductService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private IProductService productService;

    // ===== CRUD cho Sản phẩm (Sản phẩm gốc) =====
    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            var list = productService.getAllProducts();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // New endpoint: products shaped for shop listing (variant-aware price range & stock)
    @GetMapping("/shop")
    public ResponseEntity<?> getProductsForShop(@RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {
        try {
            if (page != null && size != null) {
                var pageDto = productService.getProductsForShop(page, size);
                return ResponseEntity.ok(pageDto);
            }

            var list = productService.getProductsForShop();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Integer id) {
        try {
            var dto = productService.getProductWithImagesById(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Endpoint mới: Lấy chi tiết sản phẩm đầy đủ với biến thể, thuộc tính và giá giảm
    @GetMapping("/{id}/detail")
    public ResponseEntity<?> getProductDetailWithVariants(@PathVariable Integer id) {
        try {
            var dto = productService.getProductDetailWithVariants(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("error", e.getMessage()));
        }
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

    /**
     * API chuyên sâu: Tạo sản phẩm kèm upload ảnh trong một request duy nhất
     * POST /api/products/with-images
     * Content-Type: multipart/form-data
     * 
     * Form data:
     * - tenSanPham: String (required)
     * - moTa: String (optional)
     * - maDanhMuc: Integer (optional)
     * - images: MultipartFile[] (danh sách file ảnh)
     * - thuTu: Integer[] (optional - thứ tự các ảnh)
     * - laAnhChinh: Boolean[] (optional - ảnh chính)
     * - moTaAnh: String[] (optional - mô tả từng ảnh)
     */
    @PostMapping(value = "/with-images", consumes = "multipart/form-data")
    public ResponseEntity<?> createSanPhamWithImages(
            @RequestParam("tenSanPham") String tenSanPham,
            @RequestParam(value = "moTa", required = false) String moTa,
            @RequestParam(value = "maNhaCungCap") Integer maNhaCungCap,
            @RequestParam(value = "maDanhMuc", required = false) Integer maDanhMuc,
            @RequestParam(value = "maBoSuuTap", required = false) Integer maBoSuuTap,
            @RequestParam(value = "diemThuong", required = false) Integer diemThuong,
            @RequestParam(value = "images", required = false) org.springframework.web.multipart.MultipartFile[] images,
            @RequestParam(value = "thuTu", required = false) Integer[] thuTuArray,
            @RequestParam(value = "laAnhChinh", required = false) Boolean[] laAnhChinhArray,
            @RequestParam(value = "moTaAnh", required = false) String[] moTaArray) {

        try {
            // Build SanPhamRequestDto
            SanPhamRequestDto sanPhamDto = new SanPhamRequestDto(
                    tenSanPham,
                    moTa,
                    maNhaCungCap,
                    maDanhMuc,
                    maBoSuuTap,
                    diemThuong);

            // Gọi service
            var result = productService.createSanPhamWithImages(
                    sanPhamDto,
                    images,
                    thuTuArray,
                    laAnhChinhArray,
                    moTaArray);

            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // ===== Chức năng tạo Biến thể cho sản phẩm =====
    @PostMapping("/{productId}/variants")
    public ResponseEntity<BienTheSanPham> createBienThe(@PathVariable Integer productId,
            @RequestBody BienTheRequestDto dto) {
        return new ResponseEntity<>(productService.createBienThe(productId, dto), HttpStatus.CREATED);
    }

    // ===== Chức năng gán Sản phẩm vào Danh mục =====
    @PostMapping("/{productId}/categories/{categoryId}")
    public ResponseEntity<Void> addProductToCategory(@PathVariable Integer productId,
            @PathVariable Integer categoryId) {
        productService.addProductToCategory(productId, categoryId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{productId}/variants")
    public ResponseEntity<List<BienTheSanPham>> getVariantsByProductId(@PathVariable Integer productId) {
        List<BienTheSanPham> variants = productService.getVariantsByProductId(productId);
        return ResponseEntity.ok(variants);
    }
}