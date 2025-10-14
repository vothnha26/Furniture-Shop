package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.entity.KiemKeKho;
import com.noithat.qlnt.backend.entity.KiemKeChiTiet;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.repository.KiemKeKhoRepository;
import com.noithat.qlnt.backend.repository.KiemKeChiTietRepository;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.service.IQuanLyKiemKeService;
import com.noithat.qlnt.backend.service.IQuanLyTonKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class QuanLyKiemKeServiceImpl implements IQuanLyKiemKeService {

    private static final Logger logger = LoggerFactory.getLogger(QuanLyKiemKeServiceImpl.class);

    @Autowired
    private KiemKeKhoRepository kiemKeKhoRepository;

    @Autowired
    private KiemKeChiTietRepository kiemKeChiTietRepository;

    @Autowired
    private BienTheSanPhamRepository bienTheSanPhamRepository;

    @Autowired
    private IQuanLyTonKhoService quanLyTonKhoService;

    @Override
    public KiemKeKho createInventoryCheck(String tenKiemKe, String moTa, String nguoiTao) {
        KiemKeKho kiemKeKho = new KiemKeKho();
        kiemKeKho.setTenKiemKe(tenKiemKe);
        kiemKeKho.setMoTa(moTa);
        kiemKeKho.setNguoiTao(nguoiTao);
        kiemKeKho.setTrangThai(KiemKeKho.TrangThaiKiemKe.DANG_CHUAN_BI);

        return kiemKeKhoRepository.save(kiemKeKho);
    }

    @Override
    public boolean addProductToInventoryCheck(Integer maKiemKe, Integer maBienThe) {
        try {
            // 🔹 Validation
            if (maKiemKe == null) {
                logger.error("maKiemKe is null");
                return false;
            }
            if (maBienThe == null) {
                logger.error("maBienThe is null");
                return false;
            }
            
            Optional<KiemKeKho> optionalKiemKe = kiemKeKhoRepository.findById(maKiemKe);
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);

            if (optionalKiemKe.isEmpty()) {
                logger.error("KiemKeKho not found with maKiemKe={}", maKiemKe);
                return false;
            }
            
            if (optionalBienThe.isEmpty()) {
                logger.error("BienTheSanPham not found with maBienThe={}", maBienThe);
                return false;
            }

            KiemKeKho kiemKeKho = optionalKiemKe.get();
            BienTheSanPham bienThe = optionalBienThe.get();

            // 🔹 Kiểm tra trạng thái phiếu kiểm kê
            if (kiemKeKho.getTrangThai() != KiemKeKho.TrangThaiKiemKe.DANG_CHUAN_BI) {
                logger.warn("KiemKeKho is not in DANG_CHUAN_BI state. Current state: {}", kiemKeKho.getTrangThai());
                return false;
            }

            // 🔹 Kiểm tra sản phẩm đã tồn tại chưa
            Boolean exists = kiemKeChiTietRepository.existsByKiemKeKhoAndBienTheSanPham(maKiemKe, maBienThe);
            if (exists != null && exists) {
                logger.warn("Product already exists in inventory check. maKiemKe={}, maBienThe={}", maKiemKe, maBienThe);
                return false;
            }

            // 🔹 Tạo chi tiết kiểm kê mới
            KiemKeChiTiet chiTiet = new KiemKeChiTiet(kiemKeKho, bienThe, bienThe.getSoLuongTon());
            kiemKeChiTietRepository.save(chiTiet);
            
            logger.info("Successfully added product to inventory check. maKiemKe={}, maBienThe={}", maKiemKe, maBienThe);
            return true;
        } catch (Exception e) {
            logger.error("Error adding product to inventory check maKiemKe={} maBienThe={}", maKiemKe, maBienThe, e);
            throw new RuntimeException(e);
        }
    }

    @Override
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
            logger.error("Error starting inventory check maKiemKe={}", maKiemKe, e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean updateActualQuantity(Integer maKiemKeChiTiet, Integer soLuongThucTe, String nguoiKiemKe, String lyDoChenhLech) {
        try {
            // 🔹 Validation: Check for null ID
            if (maKiemKeChiTiet == null) {
                logger.error("maKiemKeChiTiet is null");
                throw new IllegalArgumentException("Mã kiểm kê chi tiết không được để trống");
            }
            
            if (soLuongThucTe == null) {
                logger.error("soLuongThucTe is null");
                throw new IllegalArgumentException("Số lượng thực tế không được để trống");
            }
            
            Optional<KiemKeChiTiet> optionalChiTiet = kiemKeChiTietRepository.findById(maKiemKeChiTiet);
            if (optionalChiTiet.isEmpty()) {
                logger.error("KiemKeChiTiet not found with id={}", maKiemKeChiTiet);
                return false;
            }

            KiemKeChiTiet chiTiet = optionalChiTiet.get();

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
            logger.error("Error updating actual quantity maKiemKeChiTiet={}", maKiemKeChiTiet, e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean completeInventoryCheck(Integer maKiemKe, String nguoiDuyet, boolean applyChanges) {
        try {
            Optional<KiemKeKho> optionalKiemKe = kiemKeKhoRepository.findById(maKiemKe);
            if (optionalKiemKe.isEmpty()) {
                return false;
            }

            KiemKeKho kiemKeKho = optionalKiemKe.get();

            List<KiemKeChiTiet> chiTietList = kiemKeChiTietRepository.findByKiemKeKhoOrderBySku(maKiemKe);

            if (applyChanges) {
                for (KiemKeChiTiet chiTiet : chiTietList) {
                    if (chiTiet.coChenhLech() && chiTiet.getSoLuongThucTe() != null) {
                        quanLyTonKhoService.adjustStock(
                            chiTiet.getBienTheSanPham().getMaBienThe(),
                            chiTiet.getSoLuongThucTe(),
                            "Kiểm kê kho: " + kiemKeKho.getTenKiemKe() +
                            (chiTiet.getLyDoChenhLech() != null ? " - " + chiTiet.getLyDoChenhLech() : ""),
                            nguoiDuyet
                        );

                        chiTiet.duyetKetQua();
                        kiemKeChiTietRepository.save(chiTiet);
                    }
                }
            }

            kiemKeKho.hoanThanhKiemKe(nguoiDuyet);
            kiemKeKhoRepository.save(kiemKeKho);

            return true;
        } catch (Exception e) {
            logger.error("Error completing inventory check maKiemKe={}", maKiemKe, e);
            throw new RuntimeException(e);
        }
    }

    @Override
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
            logger.error("Error canceling inventory check maKiemKe={}", maKiemKe, e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<KiemKeKho> getInventoryChecksByStatus(KiemKeKho.TrangThaiKiemKe trangThai) {
        return kiemKeKhoRepository.findByTrangThaiOrderByNgayTaoDesc(trangThai);
    }

    @Override
    public List<KiemKeKho> getActiveInventoryChecks() {
        return kiemKeKhoRepository.findActiveInventoryChecks();
    }

    @Override
    public List<KiemKeChiTiet> getInventoryCheckDetails(Integer maKiemKe) {
        return kiemKeChiTietRepository.findByKiemKeKhoOrderBySku(maKiemKe);
    }

    @Override
    public List<KiemKeChiTiet> getProductsWithDifferences(Integer maKiemKe) {
        return kiemKeChiTietRepository.findWithDifferencesByKiemKeKho(maKiemKe);
    }

    @Override
    public List<KiemKeChiTiet> getShortageProducts(Integer maKiemKe) {
        return kiemKeChiTietRepository.findShortagesByKiemKeKho(maKiemKe);
    }

    @Override
    public List<KiemKeChiTiet> getSurplusProducts(Integer maKiemKe) {
        return kiemKeChiTietRepository.findSurplusByKiemKeKho(maKiemKe);
    }

    @Override
    public Object[] getInventoryCheckSummary(Integer maKiemKe) {
        return kiemKeChiTietRepository.getInventoryCheckSummary(maKiemKe);
    }

    @Override
    public BigDecimal getTotalDifferenceValue(Integer maKiemKe) {
        BigDecimal value = kiemKeChiTietRepository.getTotalDifferenceValue(maKiemKe);
        return value != null ? value : BigDecimal.ZERO;
    }

    @Override
    public List<Object[]> getInventoryCheckStatistics() {
        return kiemKeKhoRepository.getInventoryCheckStatsByStatus();
    }

    @Override
    public KiemKeKho createFullInventoryCheck(String tenKiemKe, String nguoiTao) {
        try {
            KiemKeKho kiemKeKho = createInventoryCheck(tenKiemKe, "Kiểm kê toàn bộ kho", nguoiTao);

            List<BienTheSanPham> activeProducts = bienTheSanPhamRepository.findByTrangThaiKho("ACTIVE");

            for (BienTheSanPham bienThe : activeProducts) {
                KiemKeChiTiet chiTiet = new KiemKeChiTiet(kiemKeKho, bienThe, bienThe.getSoLuongTon());
                kiemKeChiTietRepository.save(chiTiet);
            }

            return kiemKeKho;
        } catch (Exception e) {
            logger.error("Error creating full inventory check tenKiemKe={}", tenKiemKe, e);
            throw new RuntimeException(e);
        }
    }
}
