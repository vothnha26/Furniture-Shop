package com.noithat.qlnt.backend.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.noithat.qlnt.backend.dto.common.GiaTriThuocTinhDto;
import com.noithat.qlnt.backend.dto.common.ThuocTinhDto;
import com.noithat.qlnt.backend.entity.GiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.ThuocTinh;
import com.noithat.qlnt.backend.repository.GiaTriThuocTinhRepository;
import com.noithat.qlnt.backend.repository.ThuocTinhRepository;
import com.noithat.qlnt.backend.service.IAttributeService;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttributeServiceImpl implements IAttributeService {
    @Autowired private ThuocTinhRepository thuocTinhRepository;
    @Autowired private GiaTriThuocTinhRepository giaTriThuocTinhRepository;

    // ----- Quản lý Thuộc Tính -----
    public ThuocTinh createThuocTinh(ThuocTinhDto dto) {
        // Validate input
        if (dto == null || dto.tenThuocTinh() == null || dto.tenThuocTinh().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trường 'tenThuocTinh' là bắt buộc");
        }

        // Kiểm tra trùng tên thuộc tính
        if (thuocTinhRepository.existsByTenThuocTinh(dto.tenThuocTinh())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên thuộc tính '" + dto.tenThuocTinh() + "' đã tồn tại");
        }

        ThuocTinh tt = new ThuocTinh();
        tt.setTenThuocTinh(dto.tenThuocTinh().trim());
        ThuocTinh saved = thuocTinhRepository.save(tt);
        
        // Tạo các giá trị thuộc tính nếu có
        if (dto.giaTriList() != null && !dto.giaTriList().isEmpty()) {
            for (String giaTri : dto.giaTriList()) {
                GiaTriThuocTinh gttt = new GiaTriThuocTinh();
                gttt.setThuocTinh(saved);
                gttt.setGiaTri(giaTri);
                giaTriThuocTinhRepository.save(gttt);
            }
        }
        
        return saved;
    }

    public List<ThuocTinh> getAllThuocTinh() {
        return thuocTinhRepository.findAll();
    }

    // ----- HÀM MỚI -----
    public ThuocTinh updateThuocTinh(Integer id, ThuocTinhDto dto) {
        ThuocTinh tt = thuocTinhRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thuộc tính với id: " + id));
        if (dto == null || dto.tenThuocTinh() == null || dto.tenThuocTinh().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trường 'tenThuocTinh' là bắt buộc");
        }

        // Kiểm tra trùng tên (nếu đổi tên khác tên hiện tại)
        if (!tt.getTenThuocTinh().equals(dto.tenThuocTinh()) && 
            thuocTinhRepository.existsByTenThuocTinh(dto.tenThuocTinh())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên thuộc tính '" + dto.tenThuocTinh() + "' đã tồn tại");
        }
        
        tt.setTenThuocTinh(dto.tenThuocTinh().trim());
        return thuocTinhRepository.save(tt);
    }

    @Transactional
    public void deleteThuocTinh(Integer id) {
        if (!thuocTinhRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy thuộc tính với id: " + id);
        }
        // Xóa các giá trị thuộc tính liên quan trước để tránh vi phạm khóa ngoại
        List<GiaTriThuocTinh> children = giaTriThuocTinhRepository.findByThuocTinh_MaThuocTinh(id);
        if (children != null && !children.isEmpty()) {
            giaTriThuocTinhRepository.deleteAll(children);
        }
        thuocTinhRepository.deleteById(id);
    }


    // ----- Quản lý Giá trị thuộc tính -----
    public GiaTriThuocTinh createGiaTri(Integer thuocTinhId, GiaTriThuocTinhDto dto) {
        ThuocTinh thuocTinh = thuocTinhRepository.findById(thuocTinhId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thuộc tính với id: " + thuocTinhId));

        if (dto == null || dto.giaTri() == null || dto.giaTri().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trường 'giaTri' là bắt buộc");
        }

        GiaTriThuocTinh gttt = new GiaTriThuocTinh();
        gttt.setThuocTinh(thuocTinh);
        gttt.setGiaTri(dto.giaTri().trim());
        return giaTriThuocTinhRepository.save(gttt);
    }

    public List<GiaTriThuocTinh> getGiaTriByThuocTinh(Integer thuocTinhId) {
        if (!thuocTinhRepository.existsById(thuocTinhId)) {
             throw new EntityNotFoundException("Không tìm thấy thuộc tính với id: " + thuocTinhId);
        }
        return giaTriThuocTinhRepository.findByThuocTinh_MaThuocTinh(thuocTinhId);
    }

    // ----- HÀM MỚI -----
    public GiaTriThuocTinh updateGiaTriThuocTinh(Integer id, GiaTriThuocTinhDto dto) {
        GiaTriThuocTinh gttt = giaTriThuocTinhRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy giá trị thuộc tính với id: " + id));
        if (dto == null || dto.giaTri() == null || dto.giaTri().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trường 'giaTri' là bắt buộc");
        }
        gttt.setGiaTri(dto.giaTri().trim());
        return giaTriThuocTinhRepository.save(gttt);
    }

    public void deleteGiaTriThuocTinh(Integer id) {
        if (!giaTriThuocTinhRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy giá trị thuộc tính với id: " + id);
        }
        giaTriThuocTinhRepository.deleteById(id);
    }
}