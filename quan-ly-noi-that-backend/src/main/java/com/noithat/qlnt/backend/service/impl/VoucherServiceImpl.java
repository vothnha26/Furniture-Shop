package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.VoucherApplyRequest;
import com.noithat.qlnt.backend.dto.request.VoucherCreationRequest;
import com.noithat.qlnt.backend.dto.response.VoucherApplyResponse;
import com.noithat.qlnt.backend.dto.response.VoucherResponse;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.entity.Voucher;
import com.noithat.qlnt.backend.entity.VoucherHangThanhVien;
import com.noithat.qlnt.backend.entity.HangThanhVien;
import com.noithat.qlnt.backend.repository.VoucherRepository;
import com.noithat.qlnt.backend.repository.HangThanhVienRepository;
import com.noithat.qlnt.backend.exception.InvalidVoucherException;
import com.noithat.qlnt.backend.exception.ResourceNotFoundException;
import com.noithat.qlnt.backend.service.IVoucherService;
import com.noithat.qlnt.backend.service.IKhachHangService;
import com.noithat.qlnt.backend.service.IChuongTrinhGiamGiaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class VoucherServiceImpl implements IVoucherService {

    private final VoucherRepository voucherRepository;
    private final IKhachHangService khachHangService;
    private final HangThanhVienRepository hangThanhVienRepository;
    private final IChuongTrinhGiamGiaService chuongTrinhGiamGiaService;

    public VoucherServiceImpl(VoucherRepository voucherRepository, IKhachHangService khachHangService, HangThanhVienRepository hangThanhVienRepository, IChuongTrinhGiamGiaService chuongTrinhGiamGiaService) {
        this.voucherRepository = voucherRepository;
        this.khachHangService = khachHangService;
        this.hangThanhVienRepository = hangThanhVienRepository;
        this.chuongTrinhGiamGiaService = chuongTrinhGiamGiaService;
    }

    @Override
    public List<com.noithat.qlnt.backend.dto.response.VoucherByTierResponse> getVouchersGroupedByTier() {
        List<HangThanhVien> hangs = hangThanhVienRepository.findAll();
        List<com.noithat.qlnt.backend.dto.response.VoucherByTierResponse> result = new java.util.ArrayList<>();
        for (HangThanhVien hang : hangs) {
            Integer maHang = hang.getMaHangThanhVien();
            List<Voucher> matched = voucherRepository.findAll().stream()
                    .filter(v -> {
                        if (Boolean.TRUE.equals(v.getApDungChoMoiNguoi())) return true;
                        return v.getHanCheHangThanhVien().stream()
                                .anyMatch(link -> link.getHangThanhVien().getMaHangThanhVien().equals(maHang));
                    })
                    .collect(Collectors.toList());

            result.add(com.noithat.qlnt.backend.dto.response.VoucherByTierResponse.builder()
                    .maHangThanhVien(maHang)
                    .tenHang(hang.getTenHang())
                    .vouchers(matched.stream().map(this::convertToResponse).collect(Collectors.toList()))
                    .build());
        }

        List<Voucher> onlyPublic = voucherRepository.findAll().stream()
                .filter(v -> Boolean.TRUE.equals(v.getApDungChoMoiNguoi()))
                .collect(Collectors.toList());
        if (!onlyPublic.isEmpty()) {
            result.add(com.noithat.qlnt.backend.dto.response.VoucherByTierResponse.builder()
                    .maHangThanhVien(0)
                    .tenHang("Mọi người")
                    .vouchers(onlyPublic.stream().map(this::convertToResponse).collect(Collectors.toList()))
                    .build());
        }

        return result;
    }

    @Override
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

    @Override
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

        voucher.setApDungChoMoiNguoi(false);
        return voucherRepository.save(voucher);
    }

    @Override
    public List<Voucher> getEligibleVouchersForCustomer(Integer maKhachHang) {
        KhachHang khachHang = khachHangService.getKhachHangProfile(maKhachHang);
        Integer maHangThanhVien = khachHang.getHangThanhVien().getMaHangThanhVien();
        LocalDateTime now = LocalDateTime.now();

        return voucherRepository.findAll().stream()
                .filter(v -> v.getNgayBatDau().isBefore(now) && v.getNgayKetThuc().isAfter(now))
                .filter(v -> {
                    if (Boolean.TRUE.equals(v.getApDungChoMoiNguoi())) {
                        return true;
                    }
                    return v.getHanCheHangThanhVien().stream()
                            .anyMatch(link -> link.getHangThanhVien().getMaHangThanhVien().equals(maHangThanhVien));
                })
                .collect(Collectors.toList());
    }

    @Override
    public BigDecimal applyVoucher(VoucherApplyRequest request) {
        VoucherApplyResponse response = applyVoucherDetailed(request);
        return response.getSoTienGiam();
    }

    @Override
    public VoucherApplyResponse applyVoucherDetailed(VoucherApplyRequest request) {
        Voucher voucher = voucherRepository.findByMaCode(request.getMaCode())
                .orElseThrow(() -> new InvalidVoucherException("Mã Voucher không hợp lệ."));

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getNgayBatDau().isAfter(now) || voucher.getNgayKetThuc().isBefore(now)) {
            throw new InvalidVoucherException("Voucher đã hết hạn hoặc chưa kích hoạt.");
        }

        if (Boolean.FALSE.equals(voucher.getApDungChoMoiNguoi())) {
            KhachHang khachHang = khachHangService.getKhachHangProfile(request.getMaKhachHang());
            Integer maHangThanhVien = khachHang.getHangThanhVien().getMaHangThanhVien();

            boolean isEligible = voucher.getHanCheHangThanhVien().stream()
                    .anyMatch(link -> link.getHangThanhVien().getMaHangThanhVien().equals(maHangThanhVien));

            if (!isEligible) {
                throw new InvalidVoucherException("Voucher này không áp dụng cho hạng thành viên của bạn.");
            }
        }

        java.math.BigDecimal tongTien = java.math.BigDecimal.ZERO;
        if (request.getItems() == null || request.getItems().isEmpty()) {
            if (request.getTongTienDonHang() != null) {
                tongTien = request.getTongTienDonHang();
            } else {
                throw new InvalidVoucherException("Danh sách sản phẩm không hợp lệ.");
            }
        } else {
            for (VoucherApplyRequest.Item it : request.getItems()) {
                var detail = chuongTrinhGiamGiaService.getBienTheGiaChiTiet(it.getBienTheId());
                java.math.BigDecimal price = detail.getGiaHienThi();
                java.math.BigDecimal qty = new java.math.BigDecimal(it.getQuantity());
                tongTien = tongTien.add(price.multiply(qty));
            }
        }
        BigDecimal giaTriGiam = voucher.getGiaTriGiam();
        BigDecimal soTienGiam;

        if ("PERCENTAGE".equalsIgnoreCase(voucher.getLoaiGiamGia()) || "PERCENT".equalsIgnoreCase(voucher.getLoaiGiamGia())) {
            soTienGiam = tongTien.multiply(giaTriGiam.divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP));
        } else if ("FIXED".equalsIgnoreCase(voucher.getLoaiGiamGia())) {
            soTienGiam = giaTriGiam;
        } else {
            throw new InvalidVoucherException("Loại giảm giá Voucher không xác định.");
        }

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

    @Override
    public List<Voucher> getAll() {
        return voucherRepository.findAll();
    }

    @Override
    public Voucher getById(Integer id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher ID: " + id + " không tồn tại."));
    }

    @Override
    public java.util.Optional<Voucher> findByMaCodeOptional(String maCode) {
        return voucherRepository.findByMaCode(maCode);
    }

    @Override
    @Transactional
    public Voucher createVoucher(VoucherCreationRequest req) {
        validateDateRange(req.getNgayBatDau(), req.getNgayKetThuc());

        Voucher voucher = new Voucher();
        voucher.setMaCode(req.getMaCode());
        voucher.setTenVoucher(req.getTenVoucher());
        voucher.setMoTa(req.getMoTa());
        voucher.setLoaiGiamGia(req.getLoaiGiamGia());
        voucher.setGiaTriGiam(req.getGiaTriGiam());
        voucher.setGiaTriDonHangToiThieu(req.getGiaTriDonHangToiThieu() != null ? req.getGiaTriDonHangToiThieu() : BigDecimal.ZERO);
        voucher.setGiaTriGiamToiDa(req.getGiaTriGiamToiDa() != null ? req.getGiaTriGiamToiDa() : req.getGiaTriGiam());
        voucher.setNgayBatDau(req.getNgayBatDau());
        voucher.setNgayKetThuc(req.getNgayKetThuc());
        voucher.setSoLuongToiDa(req.getSoLuongToiDa() != null ? req.getSoLuongToiDa() : 1000);
        voucher.setSoLuongDaSuDung(0);
        voucher.setTrangThai(true);
        voucher.setApDungChoMoiNguoi(req.getApDungChoMoiNguoi());

        if (Boolean.FALSE.equals(req.getApDungChoMoiNguoi())) {
            var provided = req.getMaHangThanhVienIds();
            var hangIds = new java.util.HashSet<Integer>();
            if (provided != null) hangIds.addAll(provided);
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

    @Override
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

    @Override
    public void deleteVoucher(Integer id) {
        Voucher voucher = getById(id);
        voucherRepository.delete(voucher);
    }

    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new InvalidVoucherException("Khoảng thời gian không hợp lệ.");
        }
    }

    @Override
    public List<VoucherResponse> getAllVouchersWithDetails() {
        return voucherRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VoucherResponse getVoucherDetail(Integer id) {
        Voucher voucher = getById(id);
        return convertToResponse(voucher);
    }

    @Override
    public List<VoucherResponse> getEligibleVouchersWithDetails(Integer maKhachHang) {
        List<Voucher> vouchers = getEligibleVouchersForCustomer(maKhachHang);
        return vouchers.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

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
