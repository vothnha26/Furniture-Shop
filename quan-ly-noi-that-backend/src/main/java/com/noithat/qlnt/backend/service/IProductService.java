package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.request.SanPhamRequestDto;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.SanPham;
import java.util.List;

public interface IProductService {
    List<SanPham> getAllProducts();
    SanPham getProductById(Integer id);
    SanPham createSanPham(SanPhamRequestDto dto);
    SanPham updateSanPham(Integer id, SanPhamRequestDto dto);
    void deleteSanPham(Integer id);
    void addProductToCategory(Integer productId, Integer categoryId);
    BienTheSanPham createBienThe(Integer sanPhamId, BienTheRequestDto dto);
}
