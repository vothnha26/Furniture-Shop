package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.entity.KiemKeKho;
import com.noithat.qlnt.backend.entity.KiemKeChiTiet;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.repository.KiemKeKhoRepository;
import com.noithat.qlnt.backend.repository.KiemKeChiTietRepository;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class QuanLyKiemKeService {
    
    @Autowired
    private KiemKeKhoRepository kiemKeKhoRepository;
    
    @Autowired
    private KiemKeChiTietRepository kiemKeChiTietRepository;
    
    @Autowired
    private BienTheSanPhamRepository bienTheSanPhamRepository;
    
    @Autowired
    private QuanLyTonKhoService quanLyTonKhoService;
    
    // =================== INVENTORY CHECK MANAGEMENT ===================
    
    /**
     * Tạo phiếu kiểm kê mới
     */
    public KiemKeKho createInventoryCheck(String tenKiemKe, String moTa, String nguoiTao) {
        KiemKeKho kiemKeKho = new KiemKeKho();
        kiemKeKho.setTenKiemKe(tenKiemKe);
        kiemKeKho.setMoTa(moTa);
        kiemKeKho.setNguoiTao(nguoiTao);
        kiemKeKho.setTrangThai(KiemKeKho.TrangThaiKiemKe.DANG_CHUAN_BI);
        
        return kiemKeKhoRepository.save(kiemKeKho);
    }
    
    /**
     * Thêm sản phẩm vào phiếu kiểm kê
     */
    public boolean addProductToInventoryCheck(Integer maKiemKe, Integer maBienThe) {
        try {
            Optional<KiemKeKho> optionalKiemKe = kiemKeKhoRepository.findById(maKiemKe);
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            
            if (optionalKiemKe.isEmpty() || optionalBienThe.isEmpty()) {
                return false;
            }
            
            KiemKeKho kiemKeKho = optionalKiemKe.get();
            BienTheSanPham bienThe = optionalBienThe.get();
            
            // Chỉ cho phép thêm khi đang chuẩn bị
            if (kiemKeKho.getTrangThai() != KiemKeKho.TrangThaiKiemKe.DANG_CHUAN_BI) {
                return false;
            }
            
            // Kiểm tra đã tồn tại chưa
            Boolean exists = kiemKeChiTietRepository.existsByKiemKeKhoAndBienTheSanPham(maKiemKe, maBienThe);
            if (exists != null && exists) {
                return false;
            }
            
            // Tạo chi tiết kiểm kê
            KiemKeChiTiet chiTiet = new KiemKeChiTiet(kiemKeKho, bienThe, bienThe.getSoLuongTon());
            kiemKeChiTietRepository.save(chiTiet);
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Bắt đầu kiểm kê
     */
    public boolean startInventoryCheck(Integer maKiemKe) {
        try {
            Optional<KiemKeKho> optionalKiemKe = kiemKeKhoRepository.findById(maKiemKe);
            if (optionalKiemKe.isEmpty()) {
                return false;
            }
            
            KiemKeKho kiemKeKho = optionalKiemKe.get();
            kiemKeKho.batDauKiemKe();
            kiemKeKhoRepository.save(kiemKeKho);
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Cập nhật số lượng thực tế kiểm kê
     */
    public boolean updateActualQuantity(Integer maKiemKeChiTiet, Integer soLuongThucTe, 
                                      String nguoiKiemKe, String lyDoChenhLech) {
        try {
            Optional<KiemKeChiTiet> optionalChiTiet = kiemKeChiTietRepository.findById(maKiemKeChiTiet);
            if (optionalChiTiet.isEmpty()) {
                return false;
            }
            
            KiemKeChiTiet chiTiet = optionalChiTiet.get();
            
            // Chỉ cho phép cập nhật khi đang kiểm kê
            if (chiTiet.getKiemKeKho().getTrangThai() != KiemKeKho.TrangThaiKiemKe.DANG_KIEM_KE) {
                return false;
            }
            
            chiTiet.capNhatSoLuongThucTe(soLuongThucTe, nguoiKiemKe);
            if (lyDoChenhLech != null && !lyDoChenhLech.trim().isEmpty()) {
                chiTiet.setLyDoChenhLech(lyDoChenhLech);
            }
            
            kiemKeChiTietRepository.save(chiTiet);
            return true;
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Hoàn thành kiểm kê và áp dụng kết quả
     */
    public boolean completeInventoryCheck(Integer maKiemKe, String nguoiDuyet, boolean applyChanges) {
        try {
            Optional<KiemKeKho> optionalKiemKe = kiemKeKhoRepository.findById(maKiemKe);
            if (optionalKiemKe.isEmpty()) {
                return false;
            }
            
            KiemKeKho kiemKeKho = optionalKiemKe.get();
            
            // Lấy danh sách chi tiết kiểm kê
            List<KiemKeChiTiet> chiTietList = kiemKeChiTietRepository.findByKiemKeKhoOrderBySku(maKiemKe);
            
            if (applyChanges) {
                // Áp dụng kết quả kiểm kê vào tồn kho
                for (KiemKeChiTiet chiTiet : chiTietList) {
                    if (chiTiet.coChenhLech() && chiTiet.getSoLuongThucTe() != null) {
                        // Điều chỉnh tồn kho
                        quanLyTonKhoService.adjustStock(
                            chiTiet.getBienTheSanPham().getMaBienThe(),
                            chiTiet.getSoLuongThucTe(),
                            "Kiểm kê kho: " + kiemKeKho.getTenKiemKe() + 
                            (chiTiet.getLyDoChenhLech() != null ? " - " + chiTiet.getLyDoChenhLech() : ""),
                            nguoiDuyet
                        );
                        
                        // Đánh dấu đã duyệt
                        chiTiet.duyetKetQua();
                        kiemKeChiTietRepository.save(chiTiet);
                    }
                }
            }
            
            // Hoàn thành kiểm kê
            kiemKeKho.hoanThanhKiemKe(nguoiDuyet);
            kiemKeKhoRepository.save(kiemKeKho);
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Hủy kiểm kê
     */
    public boolean cancelInventoryCheck(Integer maKiemKe, String lyDo) {
        try {
            Optional<KiemKeKho> optionalKiemKe = kiemKeKhoRepository.findById(maKiemKe);
            if (optionalKiemKe.isEmpty()) {
                return false;
            }
            
            KiemKeKho kiemKeKho = optionalKiemKe.get();
            kiemKeKho.huyKiemKe();
            kiemKeKho.setGhiChu(lyDo);
            kiemKeKhoRepository.save(kiemKeKho);
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    // =================== QUERY OPERATIONS ===================
    
    /**
     * Lấy danh sách phiếu kiểm kê theo trạng thái
     */
    public List<KiemKeKho> getInventoryChecksByStatus(KiemKeKho.TrangThaiKiemKe trangThai) {
        return kiemKeKhoRepository.findByTrangThaiOrderByNgayTaoDesc(trangThai);
    }
    
    /**
     * Lấy danh sách phiếu kiểm kê đang hoạt động
     */
    public List<KiemKeKho> getActiveInventoryChecks() {
        return kiemKeKhoRepository.findActiveInventoryChecks();
    }
    
    /**
     * Lấy chi tiết kiểm kê theo phiếu
     */
    public List<KiemKeChiTiet> getInventoryCheckDetails(Integer maKiemKe) {
        return kiemKeChiTietRepository.findByKiemKeKhoOrderBySku(maKiemKe);
    }
    
    /**
     * Lấy danh sách sản phẩm có chênh lệch
     */
    public List<KiemKeChiTiet> getProductsWithDifferences(Integer maKiemKe) {
        return kiemKeChiTietRepository.findWithDifferencesByKiemKeKho(maKiemKe);
    }
    
    /**
     * Lấy danh sách sản phẩm thiếu hàng
     */
    public List<KiemKeChiTiet> getShortageProducts(Integer maKiemKe) {
        return kiemKeChiTietRepository.findShortagesByKiemKeKho(maKiemKe);
    }
    
    /**
     * Lấy danh sách sản phẩm thừa hàng
     */
    public List<KiemKeChiTiet> getSurplusProducts(Integer maKiemKe) {
        return kiemKeChiTietRepository.findSurplusByKiemKeKho(maKiemKe);
    }
    
    /**
     * Lấy tổng kết kiểm kê
     */
    public Object[] getInventoryCheckSummary(Integer maKiemKe) {
        return kiemKeChiTietRepository.getInventoryCheckSummary(maKiemKe);
    }
    
    /**
     * Tính tổng giá trị chênh lệch
     */
    public BigDecimal getTotalDifferenceValue(Integer maKiemKe) {
        BigDecimal value = kiemKeChiTietRepository.getTotalDifferenceValue(maKiemKe);
        return value != null ? value : BigDecimal.ZERO;
    }
    
    /**
     * Thống kê kiểm kê theo trạng thái
     */
    public List<Object[]> getInventoryCheckStatistics() {
        return kiemKeKhoRepository.getInventoryCheckStatsByStatus();
    }
    
    /**
     * Tạo kiểm kê tự động cho tất cả sản phẩm đang hoạt động
     */
    public KiemKeKho createFullInventoryCheck(String tenKiemKe, String nguoiTao) {
        try {
            // Tạo phiếu kiểm kê
            KiemKeKho kiemKeKho = createInventoryCheck(tenKiemKe, "Kiểm kê toàn bộ kho", nguoiTao);
            
            // Lấy tất cả sản phẩm đang hoạt động
            List<BienTheSanPham> activeProducts = bienTheSanPhamRepository.findByTrangThaiKho("ACTIVE");
            
            // Thêm vào phiếu kiểm kê
            for (BienTheSanPham bienThe : activeProducts) {
                KiemKeChiTiet chiTiet = new KiemKeChiTiet(kiemKeKho, bienThe, bienThe.getSoLuongTon());
                kiemKeChiTietRepository.save(chiTiet);
            }
            
            return kiemKeKho;
        } catch (Exception e) {
            return null;
        }
    }
}