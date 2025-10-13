package com.noithat.qlnt.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO này được sử dụng khi TẠO MỚI một biến thể sản phẩm.
 * Nó yêu cầu danh sách các ID của giá trị thuộc tính để xác định biến thể.
 */
public record BienTheRequestDto(
    String sku,
    BigDecimal giaBan,
    Integer soLuongTon,
    List<Integer> giaTriThuocTinhIds // Quan trọng: Dùng để tạo liên kết
) {}