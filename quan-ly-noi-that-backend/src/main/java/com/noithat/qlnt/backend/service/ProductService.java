package com.noithat.qlnt.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.noithat.qlnt.backend.dto.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.SanPhamRequestDto;
import com.noithat.qlnt.backend.entity.BienTheGiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.DanhMuc;
import com.noithat.qlnt.backend.entity.GiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.NhaCungCap;
import com.noithat.qlnt.backend.entity.SanPham;
import com.noithat.qlnt.backend.repository.BienTheGiaTriThuocTinhRepository;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.repository.DanhMucRepository;
import com.noithat.qlnt.backend.repository.GiaTriThuocTinhRepository;
import com.noithat.qlnt.backend.repository.NhaCungCapRepository;
import com.noithat.qlnt.backend.repository.SanPhamRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ProductService {
    @Autowired private SanPhamRepository sanPhamRepository;
    @Autowired private DanhMucRepository danhMucRepository;
    @Autowired private NhaCungCapRepository nhaCungCapRepository;
    @Autowired private BienTheSanPhamRepository bienTheRepository;
    @Autowired private GiaTriThuocTinhRepository giaTriThuocTinhRepository;
    @Autowired private BienTheGiaTriThuocTinhRepository bienTheGiaTriThuocTinhRepository;

    private SanPham findProductById(Integer id) {
        return sanPhamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm với id: " + id));
    }

    // ===== CRUD cho Sản phẩm (Sản phẩm gốc) =====

    public List<SanPham> getAllProducts() {
        return sanPhamRepository.findAll();
    }

    public SanPham getProductById(Integer id) {
        return findProductById(id);
    }

    @Transactional
    public SanPham createSanPham(SanPhamRequestDto dto) {
        // Tìm nhà cung cấp, logic này vẫn giữ nguyên
        NhaCungCap ncc = nhaCungCapRepository.findById(dto.maNhaCungCap())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà cung cấp với id: " + dto.maNhaCungCap()));

        SanPham sp = new SanPham();
        sp.setTenSanPham(dto.tenSanPham());
        sp.setMoTa(dto.moTa());
        sp.setChieuDai(dto.chieuDai());
        sp.setChieuRong(dto.chieuRong());
        sp.setChieuCao(dto.chieuCao());
        sp.setCanNang(dto.canNang());
        sp.setNhaCungCap(ncc);
        // Không còn gán bộ sưu tập ở đây nữa
        return sanPhamRepository.save(sp);
    }

    @Transactional
    public SanPham updateSanPham(Integer id, SanPhamRequestDto dto) {
        SanPham sp = findProductById(id);
        NhaCungCap ncc = nhaCungCapRepository.findById(dto.maNhaCungCap())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà cung cấp với id: " + dto.maNhaCungCap()));

        sp.setTenSanPham(dto.tenSanPham());
        sp.setMoTa(dto.moTa());
        sp.setChieuDai(dto.chieuDai());
        sp.setChieuRong(dto.chieuRong());
        sp.setChieuCao(dto.chieuCao());
        sp.setCanNang(dto.canNang());
        sp.setNhaCungCap(ncc);
        // Không còn cập nhật bộ sưu tập ở đây nữa
        return sanPhamRepository.save(sp);
    }

    @Transactional
    public void deleteSanPham(Integer id) {
        if (!sanPhamRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm với id: " + id);
        }
        sanPhamRepository.deleteById(id);
    }

    // ===== Các chức năng liên quan =====

    @Transactional
    public void addProductToCategory(Integer productId, Integer categoryId) {
        SanPham sp = findProductById(productId);
        DanhMuc dm = danhMucRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy danh mục với id: " + categoryId));
        sp.setDanhMuc(dm);
        sanPhamRepository.save(sp);
    }

    @Transactional
    public BienTheSanPham createBienThe(Integer sanPhamId, BienTheRequestDto dto) {
        SanPham sp = findProductById(sanPhamId);

        BienTheSanPham bt = new BienTheSanPham();
        bt.setSanPham(sp);
        bt.setSku(dto.sku());
        bt.setGiaBan(dto.giaBan());
        bt.setSoLuongTon(dto.soLuongTon());
        BienTheSanPham savedBienThe = bienTheRepository.save(bt);

        List<GiaTriThuocTinh> giaTriList = giaTriThuocTinhRepository.findAllById(dto.giaTriThuocTinhIds());
        if(giaTriList.size() != dto.giaTriThuocTinhIds().size()){
            throw new IllegalArgumentException("Một hoặc nhiều giá trị thuộc tính không hợp lệ.");
        }

        for (GiaTriThuocTinh gttt : giaTriList) {
            BienTheGiaTriThuocTinh link = new BienTheGiaTriThuocTinh();
            link.setBienTheSanPham(savedBienThe);
            link.setGiaTriThuocTinh(gttt);
            bienTheGiaTriThuocTinhRepository.save(link);
        }
        return savedBienThe;
    }
}