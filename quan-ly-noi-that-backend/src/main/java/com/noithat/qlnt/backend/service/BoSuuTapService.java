package com.noithat.qlnt.backend.service;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.noithat.qlnt.backend.dto.BoSuuTapDto;
import com.noithat.qlnt.backend.entity.BoSuuTap;
import com.noithat.qlnt.backend.entity.SanPham;
import com.noithat.qlnt.backend.repository.BoSuuTapRepository;
import com.noithat.qlnt.backend.repository.SanPhamRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class BoSuuTapService {
    @Autowired
    private BoSuuTapRepository boSuuTapRepository;
    @Autowired
    private SanPhamRepository sanPhamRepository;
    public List<BoSuuTap> getAll() {
        return boSuuTapRepository.findAll();
    }

    public BoSuuTap create(BoSuuTapDto dto) {
        BoSuuTap bst = new BoSuuTap();
        bst.setTenBoSuuTap(dto.tenBoSuuTap());
        bst.setMoTa(dto.moTa());
        return boSuuTapRepository.save(bst);
    }

    public BoSuuTap update(Integer id, BoSuuTapDto dto) {
        BoSuuTap bst = boSuuTapRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bộ sưu tập với id: " + id));

        bst.setTenBoSuuTap(dto.tenBoSuuTap());
        bst.setMoTa(dto.moTa());
        return boSuuTapRepository.save(bst);
    }

    public void delete(Integer id) {
        if (!boSuuTapRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy bộ sưu tập với id: " + id);
        }
        boSuuTapRepository.deleteById(id);
    }
    public void addProductToCollection(Integer collectionId, Integer productId) {
        BoSuuTap bst = boSuuTapRepository.findById(collectionId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bộ sưu tập: " + collectionId));
        SanPham sp = sanPhamRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm: " + productId));

        bst.getSanPhams().add(sp);
        boSuuTapRepository.save(bst);
    }

    public void removeProductFromCollection(Integer collectionId, Integer productId) {
        BoSuuTap bst = boSuuTapRepository.findById(collectionId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bộ sưu tập: " + collectionId));
        SanPham sp = sanPhamRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm: " + productId));
                
        bst.getSanPhams().remove(sp);
        boSuuTapRepository.save(bst);
    }

    public Set<SanPham> getProductsInCollection(Integer collectionId) {
        BoSuuTap bst = boSuuTapRepository.findById(collectionId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bộ sưu tập: " + collectionId));
        return bst.getSanPhams();
    }

    public BoSuuTap getById(Integer id) {
        BoSuuTap bst = boSuuTapRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bộ sưu tập với id: " + id));
        // touch collection to ensure it is initialized for serialization
        bst.getSanPhams().size();
        return bst;
    }
}