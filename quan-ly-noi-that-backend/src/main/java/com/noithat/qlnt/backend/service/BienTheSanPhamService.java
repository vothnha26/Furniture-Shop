package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.BienTheUpdateRequestDto;
import com.noithat.qlnt.backend.entity.BienTheGiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.GiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.SanPham;
import com.noithat.qlnt.backend.repository.BienTheGiaTriThuocTinhRepository;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.repository.GiaTriThuocTinhRepository;
import com.noithat.qlnt.backend.repository.SanPhamRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BienTheSanPhamService {

    @Autowired
    private BienTheSanPhamRepository bienTheSanPhamRepository;

    @Autowired
    private SanPhamRepository sanPhamRepository;

    @Autowired
    private GiaTriThuocTinhRepository giaTriThuocTinhRepository;

    @Autowired
    private BienTheGiaTriThuocTinhRepository bienTheGiaTriThuocTinhRepository;

    /**
     * Lấy tất cả biến thể sản phẩm với phân trang
     */
    public Page<BienTheSanPham> getAllBienTheSanPham(Pageable pageable) {
        return bienTheSanPhamRepository.findAll(pageable);
    }

    /**
     * Lấy biến thể sản phẩm theo ID
     */
    public BienTheSanPham getBienTheSanPhamById(Integer id) {
        return bienTheSanPhamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + id));
    }

    /**
     * Lấy danh sách biến thể theo mã sản phẩm
     */
    public List<BienTheSanPham> getBienTheBySanPhamId(Integer maSanPham) {
        if (!sanPhamRepository.existsById(maSanPham)) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm với ID: " + maSanPham);
        }
        return bienTheSanPhamRepository.findBySanPham_MaSanPham(maSanPham);
    }

    /**
     * Tạo mới biến thể sản phẩm
     */
    @Transactional
    public BienTheSanPham createBienTheSanPham(Integer maSanPham, BienTheRequestDto request) {
        // Kiểm tra sản phẩm tồn tại
        SanPham sanPham = sanPhamRepository.findById(maSanPham)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm với ID: " + maSanPham));

        // Kiểm tra SKU unique
        if (bienTheSanPhamRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException("SKU đã tồn tại: " + request.sku());
        }

        // Tạo biến thể mới
        BienTheSanPham bienThe = new BienTheSanPham();
        bienThe.setSanPham(sanPham);
        bienThe.setSku(request.sku());
        bienThe.setGiaBan(request.giaBan());
        bienThe.setSoLuongTon(request.soLuongTon());

        // Lưu biến thể
        BienTheSanPham savedBienThe = bienTheSanPhamRepository.save(bienThe);

        // Tạo liên kết với giá trị thuộc tính
        if (request.giaTriThuocTinhIds() != null && !request.giaTriThuocTinhIds().isEmpty()) {
            for (Integer giaTriId : request.giaTriThuocTinhIds()) {
                GiaTriThuocTinh giaTri = giaTriThuocTinhRepository.findById(giaTriId)
                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giá trị thuộc tính với ID: " + giaTriId));

                BienTheGiaTriThuocTinh lienKet = new BienTheGiaTriThuocTinh();
                BienTheGiaTriThuocTinh.BienTheGiaTriThuocTinhId id = 
                    new BienTheGiaTriThuocTinh.BienTheGiaTriThuocTinhId();
                id.setMaBienThe(savedBienThe.getMaBienThe());
                id.setMaGiaTri(giaTriId);
                
                lienKet.setId(id);
                lienKet.setBienTheSanPham(savedBienThe);
                lienKet.setGiaTriThuocTinh(giaTri);

                bienTheGiaTriThuocTinhRepository.save(lienKet);
            }
        }

        return savedBienThe;
    }

    /**
     * Cập nhật biến thể sản phẩm
     */
    @Transactional
    public BienTheSanPham updateBienTheSanPham(Integer id, BienTheUpdateRequestDto request) {
        BienTheSanPham bienThe = getBienTheSanPhamById(id);

        // Kiểm tra SKU unique nếu thay đổi
        if (!bienThe.getSku().equals(request.sku()) && 
            bienTheSanPhamRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException("SKU đã tồn tại: " + request.sku());
        }

        bienThe.setSku(request.sku());
        bienThe.setGiaBan(request.giaBan());
        bienThe.setSoLuongTon(request.soLuongTon());

        return bienTheSanPhamRepository.save(bienThe);
    }

    /**
     * Xóa biến thể sản phẩm
     */
    @Transactional
    public void deleteBienTheSanPham(Integer id) {
        BienTheSanPham bienThe = getBienTheSanPhamById(id);
        
        // Xóa các liên kết với giá trị thuộc tính trước
        bienTheGiaTriThuocTinhRepository.deleteByBienTheSanPham_MaBienThe(id);
        
        // Xóa biến thể
        bienTheSanPhamRepository.delete(bienThe);
    }

    /**
     * Cập nhật số lượng tồn kho
     */
    @Transactional
    public BienTheSanPham updateSoLuongTon(Integer id, Integer soLuong) {
        BienTheSanPham bienThe = getBienTheSanPhamById(id);
        bienThe.setSoLuongTon(soLuong);
        return bienTheSanPhamRepository.save(bienThe);
    }

    /**
     * Kiểm tra tồn kho
     */
    public boolean checkTonKho(Integer id, Integer soLuongCanKiem) {
        BienTheSanPham bienThe = getBienTheSanPhamById(id);
        return bienThe.getSoLuongTon() >= soLuongCanKiem;
    }

    /**
     * Tìm kiếm biến thể theo SKU
     */
    public BienTheSanPham findBySku(String sku) {
        return bienTheSanPhamRepository.findBySku(sku)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể với SKU: " + sku));
    }

    /**
     * Lấy thông tin chi tiết biến thể sản phẩm
     */
    public com.noithat.qlnt.backend.dto.response.BienTheSanPhamDetailResponse getBienTheSanPhamDetail(Integer id) {
        BienTheSanPham bienThe = getBienTheSanPhamById(id);
        
        // Lấy thông tin thuộc tính
        List<BienTheGiaTriThuocTinh> thuocTinhLinks = bienTheGiaTriThuocTinhRepository
                .findByBienTheSanPham_MaBienThe(id);
        
        List<com.noithat.qlnt.backend.dto.response.BienTheSanPhamDetailResponse.ThuocTinhBienTheResponse> thuocTinhs = 
                thuocTinhLinks.stream()
                .<com.noithat.qlnt.backend.dto.response.BienTheSanPhamDetailResponse.ThuocTinhBienTheResponse>map(link -> {
                    GiaTriThuocTinh giaTri = link.getGiaTriThuocTinh();
                    return com.noithat.qlnt.backend.dto.response.BienTheSanPhamDetailResponse.ThuocTinhBienTheResponse.builder()
                            .maThuocTinh(giaTri.getThuocTinh().getMaThuocTinh())
                            .tenThuocTinh(giaTri.getThuocTinh().getTenThuocTinh())
                            .maGiaTriThuocTinh(giaTri.getMaGiaTri())
                            .giaTriThuocTinh(giaTri.getGiaTri())
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());
        
        return com.noithat.qlnt.backend.dto.response.BienTheSanPhamDetailResponse.builder()
                .maBienThe(bienThe.getMaBienThe())
                .sku(bienThe.getSku())
                .giaBan(bienThe.getGiaBan())
                .soLuongTon(bienThe.getSoLuongTon())
                .maSanPham(bienThe.getSanPham().getMaSanPham())
                .tenSanPham(bienThe.getSanPham().getTenSanPham())
                .thuocTinhs(thuocTinhs)
                .build();
    }
}