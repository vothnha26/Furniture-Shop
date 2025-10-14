package com.noithat.qlnt.backend.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.noithat.qlnt.backend.dto.request.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.request.BienTheUpdateRequestDto;
import com.noithat.qlnt.backend.entity.BienTheGiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.GiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.SanPham;
import com.noithat.qlnt.backend.repository.BienTheGiaTriThuocTinhRepository;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.repository.GiaTriThuocTinhRepository;
import com.noithat.qlnt.backend.repository.SanPhamRepository;
import com.noithat.qlnt.backend.service.IVariantService;

import jakarta.persistence.EntityNotFoundException;

/**
 * Implementation của IVariantService
 * Xử lý logic nghiệp vụ quản lý biến thể sản phẩm
 */
@Service
public class VariantServiceImpl implements IVariantService {

    @Autowired
    private BienTheSanPhamRepository bienTheRepository;

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private GiaTriThuocTinhRepository giaTriThuocTinhRepository;

    @Autowired
    private BienTheGiaTriThuocTinhRepository bienTheGiaTriThuocTinhRepository;

    private BienTheSanPham findVariantById(Integer id) {
        return bienTheRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể với id: " + id));
    }

    @Override
    @Transactional
    public BienTheSanPham createVariant(BienTheRequestDto dto) {
        // Validate và lấy sản phẩm
        if (dto.maSanPham() == null) {
            throw new IllegalArgumentException("Mã sản phẩm không được để trống");
        }
        
        SanPham sanPham = sanPhamRepository.findById(dto.maSanPham())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm với id: " + dto.maSanPham()));

        // Tạo biến thể mới
        BienTheSanPham bienThe = new BienTheSanPham();
        bienThe.setSanPham(sanPham);
        bienThe.setSku(dto.sku());
        bienThe.setGiaBan(dto.giaBan());
        bienThe.setSoLuongTon(dto.soLuongTon());
        BienTheSanPham savedBienThe = bienTheRepository.save(bienThe);

        // Liên kết các giá trị thuộc tính nếu client gửi
        if (dto.giaTriThuocTinhIds() != null && !dto.giaTriThuocTinhIds().isEmpty()) {
            List<GiaTriThuocTinh> giaTriList = giaTriThuocTinhRepository.findAllById(dto.giaTriThuocTinhIds());
            if (giaTriList.size() != dto.giaTriThuocTinhIds().size()) {
                throw new IllegalArgumentException("Một hoặc nhiều giá trị thuộc tính không hợp lệ");
            }

            for (GiaTriThuocTinh giaTriThuocTinh : giaTriList) {
                BienTheGiaTriThuocTinh link = new BienTheGiaTriThuocTinh();
                link.setBienTheSanPham(savedBienThe);
                link.setGiaTriThuocTinh(giaTriThuocTinh);
                bienTheGiaTriThuocTinhRepository.save(link);
            }
        }

        return savedBienThe;
    }

    @Override
    public List<BienTheSanPham> getVariantsByProductId(Integer productId) {
        if (!sanPhamRepository.existsById(productId)) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm với id: " + productId);
        }
        return bienTheRepository.findBySanPham_MaSanPham(productId);
    }

    @Override
    public BienTheSanPham getVariantById(Integer id) {
        return findVariantById(id);
    }

    @Override
    @Transactional
    public BienTheSanPham updateVariant(Integer id, BienTheUpdateRequestDto dto) {
        BienTheSanPham variant = findVariantById(id);
        variant.setSku(dto.sku());
        variant.setGiaBan(dto.giaBan());
        variant.setSoLuongTon(dto.soLuongTon());
        return bienTheRepository.save(variant);
    }

    @Override
    @Transactional
    public void deleteVariant(Integer id) {
        if (!bienTheRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy biến thể với id: " + id);
        }
        // Xóa các liên kết giá trị thuộc tính trước để tránh vi phạm FK
        List<BienTheGiaTriThuocTinh> links = bienTheGiaTriThuocTinhRepository.findByBienTheSanPham_MaBienThe(id);
        if (links != null && !links.isEmpty()) {
            bienTheGiaTriThuocTinhRepository.deleteAll(links);
        }
        bienTheRepository.deleteById(id);
    }
}
