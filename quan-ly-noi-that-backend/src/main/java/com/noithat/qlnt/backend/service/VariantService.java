package com.noithat.qlnt.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.noithat.qlnt.backend.dto.BienTheUpdateRequestDto;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.repository.SanPhamRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class VariantService {

    @Autowired
    private BienTheSanPhamRepository bienTheRepository;

    @Autowired
    private SanPhamRepository sanPhamRepository;

    private BienTheSanPham findVariantById(Integer id) {
        return bienTheRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể với id: " + id));
    }

    public List<BienTheSanPham> getVariantsByProductId(Integer productId) {
        if (!sanPhamRepository.existsById(productId)) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm với id: " + productId);
        }
        return bienTheRepository.findBySanPham_MaSanPham(productId);
    }

    public BienTheSanPham getVariantById(Integer id) {
        return findVariantById(id);
    }

    @Transactional
    public BienTheSanPham updateVariant(Integer id, BienTheUpdateRequestDto dto) {
        BienTheSanPham variant = findVariantById(id);
        variant.setSku(dto.sku());
        variant.setGiaBan(dto.giaBan());
        variant.setSoLuongTon(dto.soLuongTon());
        return bienTheRepository.save(variant);
    }

    @Transactional
    public void deleteVariant(Integer id) {
        if (!bienTheRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy biến thể với id: " + id);
        }
        // Lưu ý: Cần xóa các liên kết trong bảng BienThe_GiaTriThuocTinh trước khi xóa
        // Tuy nhiên, nếu cấu hình orphanRemoval=true hoặc cascade, Hibernate có thể tự xử lý
        bienTheRepository.deleteById(id);
    }
}