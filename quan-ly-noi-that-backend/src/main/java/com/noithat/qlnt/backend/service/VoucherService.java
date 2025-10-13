package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.VoucherApplyRequest;
import com.noithat.qlnt.backend.dto.request.VoucherCreationRequest;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.entity.Voucher;
import com.noithat.qlnt.backend.entity.VoucherHangThanhVien;
import com.noithat.qlnt.backend.entity.HangThanhVien;
import com.noithat.qlnt.backend.repository.VoucherRepository;
import com.noithat.qlnt.backend.repository.HangThanhVienRepository;
import com.noithat.qlnt.backend.exception.InvalidVoucherException;
import com.noithat.qlnt.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final KhachHangService khachHangService;
    private final HangThanhVienRepository hangThanhVienRepository;

    public VoucherService(VoucherRepository voucherRepository, KhachHangService khachHangService, HangThanhVienRepository hangThanhVienRepository) {
        this.voucherRepository = voucherRepository;
        this.khachHangService = khachHangService;
        this.hangThanhVienRepository = hangThanhVienRepository;
    }

    /**
     * Lấy danh sách Voucher khách hàng này có thể sử dụng (dựa trên hạng thành viên)
     */
    public List<Voucher> getEligibleVouchersForCustomer(Integer maKhachHang) {
        KhachHang khachHang = khachHangService.getKhachHangProfile(maKhachHang);
        Integer maHangThanhVien = khachHang.getHangThanhVien().getMaHangThanhVien();
        LocalDateTime now = LocalDateTime.now();

        return voucherRepository.findAll().stream()
                .filter(v -> v.getNgayBatDau().isBefore(now) && v.getNgayKetThuc().isAfter(now))
                .filter(v -> {
                    // 1. Voucher áp dụng cho mọi người
                    if (Boolean.TRUE.equals(v.getApDungChoMoiNguoi())) {
                        return true;
                    }
                    // 2. Kiểm tra hạn chế hạng thành viên
                    return v.getHanCheHangThanhVien().stream()
                            .anyMatch(link -> link.getHangThanhVien().getMaHangThanhVien().equals(maHangThanhVien));
                })
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra và tính toán giảm giá khi áp dụng Voucher.
     */
    public BigDecimal applyVoucher(VoucherApplyRequest request) {
        Voucher voucher = voucherRepository.findByMaCode(request.getMaCode())
                .orElseThrow(() -> new InvalidVoucherException("Mã Voucher không hợp lệ."));

        // --- 1. Kiểm tra Hạn sử dụng ---
        LocalDateTime now = LocalDateTime.now();
        if (voucher.getNgayBatDau().isAfter(now) || voucher.getNgayKetThuc().isBefore(now)) {
            throw new InvalidVoucherException("Voucher đã hết hạn hoặc chưa kích hoạt.");
        }

        // --- 2. Kiểm tra Điều kiện áp dụng (Hạng Thành Viên) ---
        if (Boolean.FALSE.equals(voucher.getApDungChoMoiNguoi())) {
            KhachHang khachHang = khachHangService.getKhachHangProfile(request.getMaKhachHang());
            Integer maHangThanhVien = khachHang.getHangThanhVien().getMaHangThanhVien();

            boolean isEligible = voucher.getHanCheHangThanhVien().stream()
                    .anyMatch(link -> link.getHangThanhVien().getMaHangThanhVien().equals(maHangThanhVien));

            if (!isEligible) {
                throw new InvalidVoucherException("Voucher này không áp dụng cho hạng thành viên của bạn.");
            }
        }

        // --- 3. Tính toán Giảm giá ---
        BigDecimal tongTien = request.getTongTienDonHang();
        BigDecimal giaTriGiam = voucher.getGiaTriGiam();
        BigDecimal soTienGiam;

        if ("PERCENT".equalsIgnoreCase(voucher.getLoaiGiamGia())) {
            soTienGiam = tongTien.multiply(giaTriGiam.divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP));
        } else if ("FIXED".equalsIgnoreCase(voucher.getLoaiGiamGia())) {
            soTienGiam = giaTriGiam;
        } else {
            throw new InvalidVoucherException("Loại giảm giá Voucher không xác định.");
        }

        // Giới hạn số tiền giảm không vượt quá tổng tiền
        return soTienGiam.min(tongTien);
    }

    // ================== CRUD cho Admin/Nhân viên ==================

    public List<Voucher> getAll() {
        return voucherRepository.findAll();
    }

    public Voucher getById(Integer id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher ID: " + id + " không tồn tại."));
    }

    @Transactional
    public Voucher createVoucher(VoucherCreationRequest req) {
        validateDateRange(req.getNgayBatDau(), req.getNgayKetThuc());

        Voucher voucher = new Voucher();
        voucher.setMaCode(req.getMaCode());
        voucher.setLoaiGiamGia(req.getLoaiGiamGia());
        voucher.setGiaTriGiam(req.getGiaTriGiam());
        voucher.setNgayBatDau(req.getNgayBatDau());
        voucher.setNgayKetThuc(req.getNgayKetThuc());
        voucher.setApDungChoMoiNguoi(req.getApDungChoMoiNguoi());

        // Thiết lập hạn chế theo hạng nếu không áp dụng cho mọi người
        if (Boolean.FALSE.equals(req.getApDungChoMoiNguoi())) {
            if (req.getMaHangThanhVienIds() == null || req.getMaHangThanhVienIds().isEmpty()) {
                throw new InvalidVoucherException("Cần cấu hình danh sách hạng thành viên được áp dụng.");
            }
            var links = new HashSet<VoucherHangThanhVien>();
            for (Integer hangId : req.getMaHangThanhVienIds()) {
                HangThanhVien hang = hangThanhVienRepository.findById(hangId)
                        .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên ID: " + hangId + " không tồn tại."));
                VoucherHangThanhVien link = new VoucherHangThanhVien();
                link.setVoucher(voucher);
                link.setHangThanhVien(hang);
                link.setId(new VoucherHangThanhVien.VoucherHangThanhVienId(null, hang.getMaHangThanhVien()));
                links.add(link);
            }
            voucher.setHanCheHangThanhVien(links);
        } else {
            voucher.setHanCheHangThanhVien(new HashSet<>());
        }

        return voucherRepository.save(voucher);
    }

    @Transactional
    public Voucher updateVoucher(Integer id, VoucherCreationRequest req) {
        validateDateRange(req.getNgayBatDau(), req.getNgayKetThuc());

        Voucher voucher = getById(id);
        voucher.setMaCode(req.getMaCode());
        voucher.setLoaiGiamGia(req.getLoaiGiamGia());
        voucher.setGiaTriGiam(req.getGiaTriGiam());
        voucher.setNgayBatDau(req.getNgayBatDau());
        voucher.setNgayKetThuc(req.getNgayKetThuc());
        voucher.setApDungChoMoiNguoi(req.getApDungChoMoiNguoi());

        // Xóa và tạo lại liên kết hạn chế hạng
        voucher.getHanCheHangThanhVien().clear();

        if (Boolean.FALSE.equals(req.getApDungChoMoiNguoi())) {
            if (req.getMaHangThanhVienIds() == null || req.getMaHangThanhVienIds().isEmpty()) {
                throw new InvalidVoucherException("Cần cấu hình danh sách hạng thành viên được áp dụng.");
            }
            for (Integer hangId : req.getMaHangThanhVienIds()) {
                HangThanhVien hang = hangThanhVienRepository.findById(hangId)
                        .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên ID: " + hangId + " không tồn tại."));
                VoucherHangThanhVien link = new VoucherHangThanhVien();
                link.setVoucher(voucher);
                link.setHangThanhVien(hang);
                link.setId(new VoucherHangThanhVien.VoucherHangThanhVienId(voucher.getMaVoucher(), hang.getMaHangThanhVien()));
                voucher.getHanCheHangThanhVien().add(link);
            }
        }

        return voucherRepository.save(voucher);
    }

    public void deleteVoucher(Integer id) {
        Voucher voucher = getById(id);
        voucherRepository.delete(voucher);
    }

    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new InvalidVoucherException("Khoảng thời gian không hợp lệ.");
        }
    }
}