package com.noithat.qlnt.backend.dto;

public record SanPhamRequestDto(
    String tenSanPham,
    String moTa,
    Integer chieuDai,
    Integer chieuRong,
    Integer chieuCao,
    Integer canNang,
    Integer maNhaCungCap
) {}