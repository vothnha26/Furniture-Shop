package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.*;
import com.noithat.qlnt.backend.entity.*;
import com.noithat.qlnt.backend.exception.ResourceNotFoundException;
import com.noithat.qlnt.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChuongTrinhGiamGiaService {

    private final ChuongTrinhGiamGiaRepository chuongTrinhGiamGiaRepository;
    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final BienTheGiamGiaRepository bienTheGiamGiaRepository;

    public ChuongTrinhGiamGiaService(ChuongTrinhGiamGiaRepository chuongTrinhGiamGiaRepository,
                                     BienTheSanPhamRepository bienTheSanPhamRepository,
                                     BienTheGiamGiaRepository bienTheGiamGiaRepository) {
        this.chuongTrinhGiamGiaRepository = chuongTrinhGiamGiaRepository;
        this.bienTheSanPhamRepository = bienTheSanPhamRepository;
        this.bienTheGiamGiaRepository = bienTheGiamGiaRepository;
    }

    public List<ChuongTrinhGiamGia> getAll() {
        return chuongTrinhGiamGiaRepository.findAll();
    }

    public ChuongTrinhGiamGia getById(Integer id) {
        return chuongTrinhGiamGiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chương trình ID: " + id + " không tồn tại."));
    }

    @Transactional
    public ChuongTrinhGiamGia create(String ten, LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new IllegalArgumentException("Khoảng thời gian không hợp lệ.");
        }
        ChuongTrinhGiamGia ct = new ChuongTrinhGiamGia();
        ct.setTenChuongTrinh(ten);
        ct.setNgayBatDau(start);
        ct.setNgayKetThuc(end);
        return chuongTrinhGiamGiaRepository.save(ct);
    }

    @Transactional
    public ChuongTrinhGiamGia create(com.noithat.qlnt.backend.dto.request.ChuongTrinhGiamGiaRequest request) {
        if (request.getNgayBatDau() == null || request.getNgayKetThuc() == null || 
            request.getNgayKetThuc().isBefore(request.getNgayBatDau())) {
            throw new IllegalArgumentException("Khoảng thời gian không hợp lệ.");
        }
        ChuongTrinhGiamGia ct = new ChuongTrinhGiamGia();
        ct.setTenChuongTrinh(request.getTenChuongTrinh());
        ct.setMoTa(request.getMoTa());
        ct.setNgayBatDau(request.getNgayBatDau());
        ct.setNgayKetThuc(request.getNgayKetThuc());
        ct.setTrangThai(request.getTrangThai());
        ct.setLoaiGiamGia(request.getLoaiGiamGia());
        ct.setGiaTriGiam(request.getGiaTriGiam());
        return chuongTrinhGiamGiaRepository.save(ct);
    }

    @Transactional
    public ChuongTrinhGiamGia update(Integer id, String ten, LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new IllegalArgumentException("Khoảng thời gian không hợp lệ.");
        }
        ChuongTrinhGiamGia ct = getById(id);
        ct.setTenChuongTrinh(ten);
        ct.setNgayBatDau(start);
        ct.setNgayKetThuc(end);
        return chuongTrinhGiamGiaRepository.save(ct);
    }

    @Transactional
    public void delete(Integer id) {
        ChuongTrinhGiamGia ct = getById(id);
        chuongTrinhGiamGiaRepository.delete(ct);
    }

    @Transactional
    public void upsertBienTheGia(Integer maChuongTrinh, Integer maBienThe, BigDecimal giaSauGiam) {
        ChuongTrinhGiamGia ct = getById(maChuongTrinh);
        BienTheSanPham bienThe = bienTheSanPhamRepository.findById(maBienThe)
                .orElseThrow(() -> new ResourceNotFoundException("Biến thể ID: " + maBienThe + " không tồn tại."));

        BienTheGiamGia.BienTheGiamGiaId id = new BienTheGiamGia.BienTheGiamGiaId(ct.getMaChuongTrinhGiamGia(), bienThe.getMaBienThe());
        BienTheGiamGia entity = bienTheGiamGiaRepository.findById(id).orElse(new BienTheGiamGia());
        entity.setId(id);
        entity.setChuongTrinhGiamGia(ct);
        entity.setBienTheSanPham(bienThe);
        entity.setGiaSauGiam(giaSauGiam);
        bienTheGiamGiaRepository.save(entity);
    }

    @Transactional
    public void removeBienTheGia(Integer maChuongTrinh, Integer maBienThe) {
        BienTheGiamGia.BienTheGiamGiaId id = new BienTheGiamGia.BienTheGiamGiaId(maChuongTrinh, maBienThe);
        bienTheGiamGiaRepository.deleteById(id);
    }

    public BigDecimal getGiaHienThi(Integer maBienThe) {
        BienTheSanPham bienThe = bienTheSanPhamRepository.findById(maBienThe)
                .orElseThrow(() -> new ResourceNotFoundException("Biến thể ID: " + maBienThe + " không tồn tại."));

        LocalDateTime now = LocalDateTime.now();
        var active = bienTheGiamGiaRepository.findByBienTheSanPham_MaBienThe(maBienThe).stream()
                .filter(x -> x.getChuongTrinhGiamGia().getNgayBatDau().isBefore(now)
                        && x.getChuongTrinhGiamGia().getNgayKetThuc().isAfter(now))
                .collect(Collectors.toList());

        if (active.isEmpty()) {
            return bienThe.getGiaBan();
        }

        BigDecimal min = active.stream().map(BienTheGiamGia::getGiaSauGiam)
                .min(BigDecimal::compareTo)
                .orElse(bienThe.getGiaBan());
        return min.min(bienThe.getGiaBan());
    }

    /**
     * Lấy thông tin chi tiết giá của biến thể với các chương trình giảm giá đang áp dụng
     */
    public BienTheSanPhamGiaResponse getBienTheGiaChiTiet(Integer maBienThe) {
        BienTheSanPham bienThe = bienTheSanPhamRepository.findById(maBienThe)
                .orElseThrow(() -> new ResourceNotFoundException("Biến thể ID: " + maBienThe + " không tồn tại."));

        LocalDateTime now = LocalDateTime.now();
        List<BienTheGiamGia> activeDiscounts = bienTheGiamGiaRepository
                .findByBienTheSanPham_MaBienThe(maBienThe).stream()
                .filter(x -> x.getChuongTrinhGiamGia().getNgayBatDau().isBefore(now)
                        && x.getChuongTrinhGiamGia().getNgayKetThuc().isAfter(now))
                .collect(Collectors.toList());

        BigDecimal giaBanGoc = bienThe.getGiaBan();
        BigDecimal giaHienThi = giaBanGoc;
        List<BienTheSanPhamGiaResponse.ChuongTrinhDangApDung> chuongTrinhList = new ArrayList<>();

        if (!activeDiscounts.isEmpty()) {
            giaHienThi = activeDiscounts.stream()
                    .map(BienTheGiamGia::getGiaSauGiam)
                    .min(BigDecimal::compareTo)
                    .orElse(giaBanGoc);

            if (giaHienThi.compareTo(giaBanGoc) > 0) {
                giaHienThi = giaBanGoc;
            }

            for (BienTheGiamGia discount : activeDiscounts) {
                chuongTrinhList.add(BienTheSanPhamGiaResponse.ChuongTrinhDangApDung.builder()
                        .maChuongTrinh(discount.getChuongTrinhGiamGia().getMaChuongTrinhGiamGia())
                        .tenChuongTrinh(discount.getChuongTrinhGiamGia().getTenChuongTrinh())
                        .giaSauGiam(discount.getGiaSauGiam())
                        .build());
            }
        }

        boolean coGiamGia = giaHienThi.compareTo(giaBanGoc) < 0;
        BigDecimal phanTramGiam = BigDecimal.ZERO;
        BigDecimal soTienTietKiem = BigDecimal.ZERO;

        if (coGiamGia) {
            soTienTietKiem = giaBanGoc.subtract(giaHienThi);
            phanTramGiam = soTienTietKiem.divide(giaBanGoc, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        return BienTheSanPhamGiaResponse.builder()
                .maBienThe(bienThe.getMaBienThe())
                .sku(bienThe.getSku())
                .tenSanPham(bienThe.getSanPham().getTenSanPham())
                .giaBanGoc(giaBanGoc)
                .giaHienThi(giaHienThi)
                .coGiamGia(coGiamGia)
                .phanTramGiam(phanTramGiam)
                .soTienTietKiem(soTienTietKiem)
                .cacChuongTrinhDangApDung(chuongTrinhList)
                .build();
    }

    /**
     * Tạo chương trình giảm giá với danh sách biến thể
     */
    @Transactional
    public ChuongTrinhGiamGiaResponse createWithDetails(ChuongTrinhGiamGiaDetailRequest request) {
        if (request.getNgayBatDau() == null || request.getNgayKetThuc() == null 
                || request.getNgayKetThuc().isBefore(request.getNgayBatDau())) {
            throw new IllegalArgumentException("Khoảng thời gian không hợp lệ.");
        }

        ChuongTrinhGiamGia ct = new ChuongTrinhGiamGia();
        ct.setTenChuongTrinh(request.getTenChuongTrinh());
        ct.setNgayBatDau(request.getNgayBatDau());
        ct.setNgayKetThuc(request.getNgayKetThuc());
        ct = chuongTrinhGiamGiaRepository.save(ct);

        // Thêm các biến thể giảm giá
        if (request.getDanhSachBienThe() != null && !request.getDanhSachBienThe().isEmpty()) {
            for (BienTheGiamGiaRequest bienTheReq : request.getDanhSachBienThe()) {
                upsertBienTheGia(ct.getMaChuongTrinhGiamGia(), bienTheReq.getMaBienThe(), 
                        bienTheReq.getGiaSauGiam());
            }
        }

        return convertToResponse(ct);
    }

    /**
     * Cập nhật chương trình giảm giá với danh sách biến thể
     */
    @Transactional
    public ChuongTrinhGiamGiaResponse updateWithDetails(Integer id, ChuongTrinhGiamGiaDetailRequest request) {
        if (request.getNgayBatDau() == null || request.getNgayKetThuc() == null 
                || request.getNgayKetThuc().isBefore(request.getNgayBatDau())) {
            throw new IllegalArgumentException("Khoảng thời gian không hợp lệ.");
        }

        ChuongTrinhGiamGia ct = getById(id);
        ct.setTenChuongTrinh(request.getTenChuongTrinh());
        ct.setNgayBatDau(request.getNgayBatDau());
        ct.setNgayKetThuc(request.getNgayKetThuc());
        ct = chuongTrinhGiamGiaRepository.save(ct);

        // Xóa các biến thể cũ và thêm mới
        List<BienTheGiamGia> oldItems = bienTheGiamGiaRepository
                .findByChuongTrinhGiamGia_MaChuongTrinhGiamGia(id);
        bienTheGiamGiaRepository.deleteAll(oldItems);

        if (request.getDanhSachBienThe() != null && !request.getDanhSachBienThe().isEmpty()) {
            for (BienTheGiamGiaRequest bienTheReq : request.getDanhSachBienThe()) {
                upsertBienTheGia(ct.getMaChuongTrinhGiamGia(), bienTheReq.getMaBienThe(), 
                        bienTheReq.getGiaSauGiam());
            }
        }

        return convertToResponse(ct);
    }

    /**
     * Lấy chi tiết chương trình giảm giá
     */
    public ChuongTrinhGiamGiaResponse getDetailById(Integer id) {
        ChuongTrinhGiamGia ct = getById(id);
        return convertToResponse(ct);
    }

    /**
     * Lấy danh sách tất cả chương trình với thông tin tóm tắt
     */
    public List<ChuongTrinhGiamGiaResponse> getAllWithDetails() {
        return chuongTrinhGiamGiaRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Entity sang Response DTO
     */
    private ChuongTrinhGiamGiaResponse convertToResponse(ChuongTrinhGiamGia ct) {
        LocalDateTime now = LocalDateTime.now();
        String trangThai;
        if (ct.getNgayBatDau().isAfter(now)) {
            trangThai = "CHUA_BAT_DAU";
        } else if (ct.getNgayKetThuc().isBefore(now)) {
            trangThai = "DA_KET_THUC";
        } else {
            trangThai = "DANG_DIEN_RA";
        }

        List<BienTheGiamGia> items = bienTheGiamGiaRepository
                .findByChuongTrinhGiamGia_MaChuongTrinhGiamGia(ct.getMaChuongTrinhGiamGia());

        List<BienTheGiamGiaResponse> bienTheResponses = items.stream()
                .map(item -> {
                    BienTheSanPham bt = item.getBienTheSanPham();
                    BigDecimal giaBanGoc = bt.getGiaBan();
                    BigDecimal giaSauGiam = item.getGiaSauGiam();
                    BigDecimal phanTramGiam = giaBanGoc.subtract(giaSauGiam)
                            .divide(giaBanGoc, 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"));

                    return BienTheGiamGiaResponse.builder()
                            .maChuongTrinhGiamGia(item.getId().getMaChuongTrinhGiamGia())
                            .maBienThe(bt.getMaBienThe())
                            .skuBienThe(bt.getSku())
                            .tenChuongTrinh(ct.getTenChuongTrinh())
                            .giaGoc(giaBanGoc)
                            .giaSauGiam(giaSauGiam)
                            .phanTramGiam(phanTramGiam)
                            .build();
                })
                .collect(Collectors.toList());

        return ChuongTrinhGiamGiaResponse.builder()
                .maChuongTrinhGiamGia(ct.getMaChuongTrinhGiamGia())
                .tenChuongTrinh(ct.getTenChuongTrinh())
                .ngayBatDau(ct.getNgayBatDau())
                .ngayKetThuc(ct.getNgayKetThuc())
                .trangThai(trangThai)
                .soLuongBienThe(items.size())
                .danhSachBienThe(bienTheResponses)
                .build();
    }
}


