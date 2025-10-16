package com.noithat.qlnt.backend.dto.response;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopProductResponseDto {
    private Integer maSanPham;
    private String tenSanPham;
    private String moTa;
    // Friendly fields for frontend compatibility
    private Integer id; // alias of maSanPham
    private String name; // alias of tenSanPham
    private Double price; // min price (for display)
    private Double originalPrice; // max price (for display as range end)
    private Integer stockQuantity; // aggregated stock from variants

    private Double minPrice;
    private Double maxPrice;
    private Integer totalStock; // sum of variant stocks
    private Integer discountPercent; // e.g. 10 => 10% off from maxPrice down to minPrice
    private Integer availableVariantCount; // number of variants with stock > 0
    private Integer soLuongBienThe; // total variants count
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryDto {
        private Integer id;
        private String name;
    }
}
