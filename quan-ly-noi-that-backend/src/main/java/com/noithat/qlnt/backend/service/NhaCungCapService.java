package com.noithat.qlnt.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.noithat.qlnt.backend.dto.NhaCungCapDto;
import com.noithat.qlnt.backend.entity.NhaCungCap;
import com.noithat.qlnt.backend.repository.NhaCungCapRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class NhaCungCapService {

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    public List<NhaCungCap> getAllNhaCungCaps() {
        return nhaCungCapRepository.findAll();
    }

    public NhaCungCap createNhaCungCap(NhaCungCapDto dto) {
        NhaCungCap ncc = new NhaCungCap();
        ncc.setTenNhaCungCap(dto.tenNhaCungCap());
        return nhaCungCapRepository.save(ncc);
    }

    public NhaCungCap updateNhaCungCap(Integer id, NhaCungCapDto dto) {
        NhaCungCap ncc = nhaCungCapRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà cung cấp với id: " + id));
        ncc.setTenNhaCungCap(dto.tenNhaCungCap());
        return nhaCungCapRepository.save(ncc);
    }

    public void deleteNhaCungCap(Integer id) {
        if (!nhaCungCapRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy nhà cung cấp với id: " + id);
        }
        nhaCungCapRepository.deleteById(id);
    }
}