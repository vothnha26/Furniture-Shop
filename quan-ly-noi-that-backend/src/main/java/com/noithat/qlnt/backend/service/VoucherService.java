package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.*;
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
    private final ChuongTrinhGiamGiaService chuongTrinhGiamGiaService;

    public VoucherService(VoucherRepository voucherRepository, KhachHangService khachHangService, HangThanhVienRepository hangThanhVienRepository, ChuongTrinhGiamGiaService chuongTrinhGiamGiaService) {
        this.voucherRepository = voucherRepository;
        this.khachHangService = khachHangService;
        this.hangThanhVienRepository = hangThanhVienRepository;
        this.chuongTrinhGiamGiaService = chuongTrinhGiamGiaService;
    }

    /**
     * Lấy các voucher được phân loại theo hạng thành viên (bao gồm hạng 'Mọi người')
     */
    public List<com.noithat.qlnt.backend.dto.VoucherByTierResponse> getVouchersGroupedByTier() {
        // Lấy tất cả hạng
        List<HangThanhVien> hangs = hangThanhVienRepository.findAll();

        // For each hang, find vouchers that either apply to everyone or specifically to this hang
        List<com.noithat.qlnt.backend.dto.VoucherByTierResponse> result = new java.util.ArrayList<>();
        for (HangThanhVien hang : hangs) {
            Integer maHang = hang.getMaHangThanhVien();
            List<Voucher> matched = voucherRepository.findAll().stream()
                    .filter(v -> {
                        if (Boolean.TRUE.equals(v.getApDungChoMoiNguoi())) return true;
                        return v.getHanCheHangThanhVien().stream()
                                .anyMatch(link -> link.getHangThanhVien().getMaHangThanhVien().equals(maHang));
                    })
                    .collect(Collectors.toList());

            result.add(com.noithat.qlnt.backend.dto.VoucherByTierResponse.builder()
                    .maHangThanhVien(maHang)
                    .tenHang(hang.getTenHang())
                    .vouchers(matched.stream().map(this::convertToResponse).collect(Collectors.toList()))
                    .build());
        }

        // Add a special group for 'Ap dung cho moi nguoi' only (optional)
        List<Voucher> onlyPublic = voucherRepository.findAll().stream()
                .filter(v -> Boolean.TRUE.equals(v.getApDungChoMoiNguoi()))
                .collect(Collectors.toList());
        if (!onlyPublic.isEmpty()) {
            result.add(com.noithat.qlnt.backend.dto.VoucherByTierResponse.builder()
                    .maHangThanhVien(0)
                    .tenHang("Mọi người")
                    .vouchers(onlyPublic.stream().map(this::convertToResponse).collect(Collectors.toList()))
                    .build());
        }

        return result;
    }

    /**
     * Lấy danh sách voucher áp dụng cho 1 hạng thành viên nhất định
     */
    public List<VoucherResponse> getVouchersForTier(Integer maHangThanhVien) {
        hangThanhVienRepository.findById(maHangThanhVien)
                .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên ID: " + maHangThanhVien + " không tồn tại."));

        List<Voucher> matched = voucherRepository.findAll().stream()
                .filter(v -> {
                    if (Boolean.TRUE.equals(v.getApDungChoMoiNguoi())) return true;
                    return v.getHanCheHangThanhVien().stream()
                            .anyMatch(link -> link.getHangThanhVien().getMaHangThanhVien().equals(maHangThanhVien));
                })
                .collect(Collectors.toList());

        return matched.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * Gán danh sách hạng thành viên cho một voucher (thay thế)
     */
    @Transactional
    public Voucher assignTiersToVoucher(Integer maVoucher, List<Integer> maHangIds) {
        Voucher voucher = getById(maVoucher);
        voucher.getHanCheHangThanhVien().clear();

        if (maHangIds == null || maHangIds.isEmpty()) {
            throw new InvalidVoucherException("Danh sách hạng không được để trống.");
        }

        for (Integer hangId : maHangIds) {
            HangThanhVien hang = hangThanhVienRepository.findById(hangId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên ID: " + hangId + " không tồn tại."));
            VoucherHangThanhVien link = new VoucherHangThanhVien();
            link.setVoucher(voucher);
            link.setHangThanhVien(hang);
            link.setId(new VoucherHangThanhVien.VoucherHangThanhVienId(voucher.getMaVoucher(), hang.getMaHangThanhVien()));
            voucher.getHanCheHangThanhVien().add(link);
        }

        // after assigning, this voucher is restricted
        voucher.setApDungChoMoiNguoi(false);
        return voucherRepository.save(voucher);
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
     * Kiểm tra và tính toán giảm giá khi áp dụng Voucher - Trả về số tiền giảm
     */
    public BigDecimal applyVoucher(VoucherApplyRequest request) {
        VoucherApplyResponse response = applyVoucherDetailed(request);
        return response.getSoTienGiam();
    }

    /**
     * Kiểm tra và tính toán giảm giá khi áp dụng Voucher - Trả về thông tin chi tiết
     */
    public VoucherApplyResponse applyVoucherDetailed(VoucherApplyRequest request) {
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
        // Recompute subtotal on server: sum(quantity * effectivePrice(bienThe)).
        // For backward compatibility, if items are missing or empty and client supplied
        // tongTienDonHang, use that as a fallback (still preferable to require items).
        java.math.BigDecimal tongTien = java.math.BigDecimal.ZERO;
        if (request.getItems() == null || request.getItems().isEmpty()) {
            if (request.getTongTienDonHang() != null) {
                tongTien = request.getTongTienDonHang();
            } else {
                throw new InvalidVoucherException("Danh sách sản phẩm không hợp lệ.");
            }
        } else {
            for (VoucherApplyRequest.Item it : request.getItems()) {
                // getBienTheGiaChiTiet will validate existence and return effective price
                var detail = chuongTrinhGiamGiaService.getBienTheGiaChiTiet(it.getBienTheId());
                java.math.BigDecimal price = detail.getGiaHienThi();
                java.math.BigDecimal qty = new java.math.BigDecimal(it.getQuantity());
                tongTien = tongTien.add(price.multiply(qty));
            }
        }
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
        soTienGiam = soTienGiam.min(tongTien);

        return VoucherApplyResponse.builder()
                .success(true)
                .message("Áp dụng voucher thành công!")
                .maCode(voucher.getMaCode())
                .tongTienGoc(tongTien)
                .soTienGiam(soTienGiam)
                .tongTienSauGiam(tongTien.subtract(soTienGiam))
                .loaiGiamGia(voucher.getLoaiGiamGia())
                .giaTriGiam(voucher.getGiaTriGiam())
                .build();
    }

    // ================== CRUD cho Admin/Nhân viên ==================

    public List<Voucher> getAll() {
        return voucherRepository.findAll();
    }

    public Voucher getById(Integer id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher ID: " + id + " không tồn tại."));
    }

    /**
     * Tìm Voucher theo mã code (Optional)
     */
    public java.util.Optional<Voucher> findByMaCodeOptional(String maCode) {
        return voucherRepository.findByMaCode(maCode);
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
            // Always ensure member tier id=3 is included as requested
            var provided = req.getMaHangThanhVienIds();
            var hangIds = new java.util.HashSet<Integer>();
            if (provided != null) hangIds.addAll(provided);
            // add id 3 (safely)
            hangIds.add(3);

            if (hangIds.isEmpty()) {
                throw new InvalidVoucherException("Cần cấu hình danh sách hạng thành viên được áp dụng.");
            }

            var links = new HashSet<VoucherHangThanhVien>();
            for (Integer hangId : hangIds) {
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

    /**
     * Lấy danh sách voucher với thông tin chi tiết
     */
    public List<VoucherResponse> getAllVouchersWithDetails() {
        return voucherRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết voucher
     */
    public VoucherResponse getVoucherDetail(Integer id) {
        Voucher voucher = getById(id);
        return convertToResponse(voucher);
    }

    /**
     * Lấy danh sách voucher có thể sử dụng với response chi tiết
     */
    public List<VoucherResponse> getEligibleVouchersWithDetails(Integer maKhachHang) {
        List<Voucher> vouchers = getEligibleVouchersForCustomer(maKhachHang);
        return vouchers.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Entity sang Response DTO
     */
    private VoucherResponse convertToResponse(Voucher voucher) {
        LocalDateTime now = LocalDateTime.now();
        String trangThai;
        if (voucher.getNgayBatDau().isAfter(now)) {
            trangThai = "CHUA_BAT_DAU";
        } else if (voucher.getNgayKetThuc().isBefore(now)) {
            trangThai = "DA_HET_HAN";
        } else {
            trangThai = "DANG_HOAT_DONG";
        }

        List<String> tenHangThanhVienApDung = new java.util.ArrayList<>();
        if (Boolean.FALSE.equals(voucher.getApDungChoMoiNguoi()) 
                && voucher.getHanCheHangThanhVien() != null) {
            tenHangThanhVienApDung = voucher.getHanCheHangThanhVien().stream()
                    .map(link -> link.getHangThanhVien().getTenHang())
                    .collect(Collectors.toList());
        }

        return VoucherResponse.builder()
                .maVoucher(voucher.getMaVoucher())
                .maCode(voucher.getMaCode())
                .loaiGiamGia(voucher.getLoaiGiamGia())
                .giaTriGiam(voucher.getGiaTriGiam())
                .ngayBatDau(voucher.getNgayBatDau())
                .ngayKetThuc(voucher.getNgayKetThuc())
                .trangThai(trangThai)
                .apDungChoMoiNguoi(voucher.getApDungChoMoiNguoi())
                .tenHangThanhVienApDung(tenHangThanhVienApDung)
                .build();
    }
}