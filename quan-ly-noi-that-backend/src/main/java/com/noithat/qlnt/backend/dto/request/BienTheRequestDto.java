package com.noithat.qlnt.backend.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO này được sử dụng khi TẠO MỚI một biến thể sản phẩm.
 * Nó yêu cầu danh sách các ID của giá trị thuộc tính để xác định biến thể.
 * 
 * Note: maSanPham là optional nếu gọi qua /api/products/{productId}/variants
 * nhưng là required nếu gọi trực tiếp qua /api/variants
 */
public record BienTheRequestDto(
    @Positive(message = "Mã sản phẩm phải là số dương")
    Integer maSanPham,
    
    @NotBlank(message = "SKU không được để trống")
    @Size(min = 3, max = 50, message = "SKU phải có độ dài từ 3 đến 50 ký tự")
    String sku,
    
    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá bán phải lớn hơn 0")
    BigDecimal giaBan,
    
    @NotNull(message = "Số lượng tồn không được để trống")
    @Min(value = 0, message = "Số lượng tồn không được âm")
    Integer soLuongTon,
    
    // Danh sách giá trị thuộc tính là optional: cho phép tạo biến thể không kèm giá trị thuộc tính
    List<@NotNull @Positive(message = "ID giá trị thuộc tính phải là số dương") Integer> giaTriThuocTinhIds // Quan trọng: Dùng để tạo liên kết nếu có
) {}