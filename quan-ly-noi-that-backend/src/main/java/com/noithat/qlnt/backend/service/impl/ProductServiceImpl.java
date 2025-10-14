package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.BienTheRequestDto;
import com.noithat.qlnt.backend.dto.request.SanPhamRequestDto;
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
import com.noithat.qlnt.backend.service.IProductService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProductServiceImpl implements IProductService {
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

    @Override
    public List<SanPham> getAllProducts() {
        return sanPhamRepository.findAll();
    }

    @Override
    public SanPham getProductById(Integer id) {
        return findProductById(id);
    }

    @Override
    @Transactional
    public SanPham createSanPham(SanPhamRequestDto dto) {
        // Validate maNhaCungCap
        if (dto.maNhaCungCap() == null) {
            throw new IllegalArgumentException("Mã nhà cung cấp không được để trống");
        }
        
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
        return sanPhamRepository.save(sp);
    }

    @Override
    @Transactional
    public SanPham updateSanPham(Integer id, SanPhamRequestDto dto) {
        SanPham sp = findProductById(id);
        
        // Validate maNhaCungCap
        if (dto.maNhaCungCap() == null) {
            throw new IllegalArgumentException("Mã nhà cung cấp không được để trống");
        }
        
        NhaCungCap ncc = nhaCungCapRepository.findById(dto.maNhaCungCap())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà cung cấp với id: " + dto.maNhaCungCap()));

        sp.setTenSanPham(dto.tenSanPham());
        sp.setMoTa(dto.moTa());
        sp.setChieuDai(dto.chieuDai());
        sp.setChieuRong(dto.chieuRong());
        sp.setChieuCao(dto.chieuCao());
        sp.setCanNang(dto.canNang());
        sp.setNhaCungCap(ncc);
        return sanPhamRepository.save(sp);
    }

    @Override
    @Transactional
    public void deleteSanPham(Integer id) {
        if (!sanPhamRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm với id: " + id);
        }
        sanPhamRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void addProductToCategory(Integer productId, Integer categoryId) {
        SanPham sp = findProductById(productId);
        DanhMuc dm = danhMucRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy danh mục với id: " + categoryId));
        sp.setDanhMuc(dm);
        sanPhamRepository.save(sp);
    }

    @Override
    @Transactional
    public BienTheSanPham createBienThe(Integer sanPhamId, BienTheRequestDto dto) {
        // Validate consistency nếu dto có maSanPham
        if (dto.maSanPham() != null && !dto.maSanPham().equals(sanPhamId)) {
            throw new IllegalArgumentException("Mã sản phẩm trong body không khớp với mã sản phẩm trong URL");
        }
        
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
