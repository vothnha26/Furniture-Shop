package com.noithat.qlnt.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SanPhamRequestDto(
    @NotBlank(message = "Tên sản phẩm không được để trống")
    String tenSanPham,
    
    String moTa,
    
    @Positive(message = "Chiều dài phải là số dương")
    Integer chieuDai,
    
    @Positive(message = "Chiều rộng phải là số dương")
    Integer chieuRong,
    
    @Positive(message = "Chiều cao phải là số dương")
    Integer chieuCao,
    
    @Positive(message = "Cân nặng phải là số dương")
    Integer canNang,
    
    @NotNull(message = "Mã nhà cung cấp không được để trống")
    Integer maNhaCungCap
) {}