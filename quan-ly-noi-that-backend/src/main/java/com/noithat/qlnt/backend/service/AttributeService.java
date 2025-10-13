package com.noithat.qlnt.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.noithat.qlnt.backend.dto.GiaTriThuocTinhDto;
import com.noithat.qlnt.backend.dto.ThuocTinhDto;
import com.noithat.qlnt.backend.entity.GiaTriThuocTinh;
import com.noithat.qlnt.backend.entity.ThuocTinh;
import com.noithat.qlnt.backend.repository.GiaTriThuocTinhRepository;
import com.noithat.qlnt.backend.repository.ThuocTinhRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class AttributeService {
    @Autowired private ThuocTinhRepository thuocTinhRepository;
    @Autowired private GiaTriThuocTinhRepository giaTriThuocTinhRepository;

    // ----- Quản lý Thuộc Tính -----
    public ThuocTinh createThuocTinh(ThuocTinhDto dto) {
        ThuocTinh tt = new ThuocTinh();
        tt.setTenThuocTinh(dto.tenThuocTinh());
        return thuocTinhRepository.save(tt);
    }

    public List<ThuocTinh> getAllThuocTinh() {
        return thuocTinhRepository.findAll();
    }

    // ----- HÀM MỚI -----
    public ThuocTinh updateThuocTinh(Integer id, ThuocTinhDto dto) {
        ThuocTinh tt = thuocTinhRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thuộc tính với id: " + id));
        tt.setTenThuocTinh(dto.tenThuocTinh());
        return thuocTinhRepository.save(tt);
    }

    public void deleteThuocTinh(Integer id) {
        if (!thuocTinhRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy thuộc tính với id: " + id);
        }
        thuocTinhRepository.deleteById(id);
    }


    // ----- Quản lý Giá trị thuộc tính -----
    public GiaTriThuocTinh createGiaTri(Integer thuocTinhId, GiaTriThuocTinhDto dto) {
        ThuocTinh thuocTinh = thuocTinhRepository.findById(thuocTinhId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thuộc tính với id: " + thuocTinhId));

        GiaTriThuocTinh gttt = new GiaTriThuocTinh();
        gttt.setThuocTinh(thuocTinh);
        gttt.setGiaTri(dto.giaTri());
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
        gttt.setGiaTri(dto.giaTri());
        return giaTriThuocTinhRepository.save(gttt);
    }

    public void deleteGiaTriThuocTinh(Integer id) {
        if (!giaTriThuocTinhRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy giá trị thuộc tính với id: " + id);
        }
        giaTriThuocTinhRepository.deleteById(id);
    }
}