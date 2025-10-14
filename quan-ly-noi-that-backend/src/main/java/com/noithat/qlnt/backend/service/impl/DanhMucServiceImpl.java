package com.noithat.qlnt.backend.service.impl;

import java.util.Set;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.noithat.qlnt.backend.dto.common.DanhMucDto;
import com.noithat.qlnt.backend.entity.DanhMuc;
import com.noithat.qlnt.backend.repository.DanhMucRepository;
import com.noithat.qlnt.backend.service.IDanhMucService;

import jakarta.persistence.EntityNotFoundException;

/**
 * Implementation của IDanhMucService
 * Xử lý logic nghiệp vụ quản lý danh mục sản phẩm
 */
@Service
public class DanhMucServiceImpl implements IDanhMucService {

    @Autowired
    private DanhMucRepository danhMucRepository;

    private DanhMuc findCategoryById(Integer id) {
        return danhMucRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy danh mục với id: " + id));
    }

    @Override
    @Transactional
    public DanhMuc createDanhMuc(DanhMucDto dto) {
        DanhMuc danhMuc = new DanhMuc();
        danhMuc.setTenDanhMuc(dto.tenDanhMuc());
        return danhMucRepository.save(danhMuc);
    }

    @Override
    @Transactional
    public void linkParentToChild(Integer childId, Integer parentId) {
        if (childId.equals(parentId)) {
            throw new IllegalArgumentException("Không thể tự liên kết cha-con với chính nó.");
        }
        DanhMuc child = findCategoryById(childId);
        DanhMuc parent = findCategoryById(parentId);
        child.getParents().add(parent);
        danhMucRepository.save(child);
    }
    
    @Override
    @Transactional
    public DanhMuc updateDanhMuc(Integer id, DanhMucDto dto) {
        DanhMuc danhMucToUpdate = findCategoryById(id);
        danhMucToUpdate.setTenDanhMuc(dto.tenDanhMuc());
        return danhMucRepository.save(danhMucToUpdate);
    }
    
    @Override
    @Transactional
    public void unlinkParentFromChild(Integer childId, Integer parentId) {
        DanhMuc child = findCategoryById(childId);
        DanhMuc parent = findCategoryById(parentId);
        child.getParents().remove(parent);
        danhMucRepository.save(child);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<DanhMuc> getChildren(Integer parentId) {
        DanhMuc parent = findCategoryById(parentId);
        return parent.getChildren();
    }

    @Override
    @Transactional(readOnly = true)
    public Set<DanhMuc> getParents(Integer childId) {
        DanhMuc child = findCategoryById(childId);
        return child.getParents();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DanhMuc> getAll() {
        return danhMucRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteDanhMuc(Integer id) {
        DanhMuc categoryToDelete = findCategoryById(id);

        // Xóa liên kết từ các danh mục con của nó
        for (DanhMuc child : categoryToDelete.getChildren()) {
            child.getParents().remove(categoryToDelete);
        }
        categoryToDelete.getChildren().clear();

        // Xóa liên kết từ các danh mục cha của nó
        for (DanhMuc parent : categoryToDelete.getParents()) {
            parent.getChildren().remove(categoryToDelete);
        }
        categoryToDelete.getParents().clear();

        danhMucRepository.delete(categoryToDelete);
    }
}
