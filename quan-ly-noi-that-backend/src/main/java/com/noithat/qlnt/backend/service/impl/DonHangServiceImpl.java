package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.CheckoutSummaryRequest;
import com.noithat.qlnt.backend.dto.request.DonHangRequest;
import com.noithat.qlnt.backend.dto.request.ThanhToanRequest;
import com.noithat.qlnt.backend.dto.response.ChiTietDonHangResponse;
import com.noithat.qlnt.backend.dto.response.CheckoutSummaryResponse;
import com.noithat.qlnt.backend.dto.response.DonHangResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeBanHangResponse;
import com.noithat.qlnt.backend.entity.*;
import com.noithat.qlnt.backend.exception.AppException;
import com.noithat.qlnt.backend.repository.*;
import com.noithat.qlnt.backend.service.IDonHangService;
import com.noithat.qlnt.backend.service.ThanhToanService;
import com.noithat.qlnt.backend.service.IThongBaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class DonHangServiceImpl implements IDonHangService {

    private final DonHangRepository donHangRepository;
    private final KhachHangRepository khachHangRepository;
    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final VoucherRepository voucherRepository;
    private final ThanhToanService thanhToanService;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    private final LichSuTrangThaiDonHangRepository lichSuTrangThaiDonHangRepository;
    private final IThongBaoService thongBaoService;

    @Override
    @Transactional
    public DonHangResponse taoDonHang(DonHangRequest request) {
    // 1. Xác thực khách hàng (cho phép null cho đơn khách lẻ / admin)
    KhachHang khachHang = null;
    if (request.getMaKhachHang() != null) {
        khachHang = khachHangRepository.findById(request.getMaKhachHang())
            .orElseThrow(() -> new AppException(404, "Không tìm thấy khách hàng."));
    }

        // 2. Tạo đối tượng DonHang và map thông tin
        DonHang donHang = new DonHang();
    donHang.setKhachHang(khachHang);
        donHang.setNgayDatHang(LocalDateTime.now());
        donHang.setTrangThaiDonHang(request.getTrangThaiDonHang() != null ? request.getTrangThaiDonHang() : "CHO_XU_LY");
        donHang.setTrangThaiThanhToan(
                request.getTrangThaiThanhToan() != null ? request.getTrangThaiThanhToan() : "UNPAID");
        donHang.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        donHang.setGhiChu(request.getGhiChu());
        donHang.setTenNguoiNhan(request.getTenNguoiNhan());
        donHang.setSoDienThoaiNhan(request.getSoDienThoaiNhan());
        donHang.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
        donHang.setDiemThuongNhanDuoc(request.getDiemThuongNhanDuoc());

        // 3. Gọi procedure để tính toán lại toàn bộ giá trị
        CheckoutSummaryRequest summaryRequest = new CheckoutSummaryRequest();
        summaryRequest.setChiTietDonHang(request.getChiTietDonHangList());
    // Pass through maKhachHang (may be null) so stored-proc can compute correctly
    summaryRequest.setMaKhachHang(request.getMaKhachHang());
        summaryRequest.setDiemSuDung(request.getDiemThuongSuDung() != null ? request.getDiemThuongSuDung() : 0);
        summaryRequest.setMaVoucherCode(request.getMaVoucherCode());

        CheckoutSummaryResponse summary = thanhToanService.getCheckoutSummary(summaryRequest);

        // 4. Gán các giá trị đã tính vào DonHang
        donHang.setTongTienGoc(summary.getTamTinh());
        donHang.setGiamGiaVip(summary.getGiamGiaVip());
        donHang.setGiamGiaVoucher(summary.getGiamGiaVoucher());
        donHang.setDiemThuongSuDung(request.getDiemThuongSuDung());
        donHang.setGiamGiaDiemThuong(summary.getGiamGiaDiem());
        // summary.getDiemThuongNhanDuoc() returns BigDecimal (points may be returned
        // from stored-proc). DonHang.diemThuongNhanDuoc is Integer, so convert
        // safely (null -> 0).
        if (summary.getDiemThuongNhanDuoc() != null) {
            donHang.setDiemThuongNhanDuoc(summary.getDiemThuongNhanDuoc().intValue());
        } else {
            donHang.setDiemThuongNhanDuoc(0);
        }

        BigDecimal phiVanChuyen = "Miễn phí".equalsIgnoreCase(summary.getPhiGiaoHang()) ? BigDecimal.ZERO
                : new BigDecimal(summary.getPhiGiaoHang());
        donHang.setPhiGiaoHang(phiVanChuyen);
        donHang.setThanhTien(summary.getTongCong());

        // 5. Cập nhật Voucher
        if (request.getMaVoucherCode() != null && !request.getMaVoucherCode().isEmpty()) {
            Voucher voucher = voucherRepository.findByMaCode(request.getMaVoucherCode()).orElse(null);
            if (voucher != null) {
                donHang.setVoucher(voucher);
                voucher.setSoLuongDaSuDung(voucher.getSoLuongDaSuDung() + 1);
            }
        }

        // 6. Trừ điểm thưởng của khách hàng (chỉ khi có khách hàng)
        if (khachHang != null && request.getDiemThuongSuDung() != null && request.getDiemThuongSuDung() > 0) {
            int diemHienCo = khachHang.getDiemThuong() != null ? khachHang.getDiemThuong() : 0;
            if (request.getDiemThuongSuDung() > diemHienCo) {
                throw new AppException(400, "Số điểm sử dụng vượt quá số điểm hiện có.");
            }
            khachHang.setDiemThuong(diemHienCo - request.getDiemThuongSuDung());
        }

        // NOTE: Do NOT award earned loyalty points here. The order stores the
        // server-calculated earned points in donHang.diemThuongNhanDuoc, but the
        // actual increase to the customer's point balance should occur only when
        // the order reaches HOAN_THANH. That behavior is implemented centrally in
        // QuanLyTrangThaiDonHangServiceImpl to ensure a single place handles
        // side-effects like awarding/refunding points and voucher/stock rollbacks.

        // 6c. Cập nhật tổng chi tiêu và tổng đơn hàng của khách hàng (nếu có)
        if (khachHang != null) {
            java.math.BigDecimal currentTotal = khachHang.getTongChiTieu() != null ? khachHang.getTongChiTieu() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal orderAmount = summary.getTongCong() != null ? summary.getTongCong() : java.math.BigDecimal.ZERO;
            khachHang.setTongChiTieu(currentTotal.add(orderAmount));
            Integer currentOrders = khachHang.getTongDonHang() != null ? khachHang.getTongDonHang() : 0;
            khachHang.setTongDonHang(currentOrders + 1);
            // Persist changes (same transaction)
            khachHangRepository.save(khachHang);
        }

    // 7. Tạo ChiTietDonHang và Trừ kho
    List<ChiTietDonHang> chiTietList = new ArrayList<>();
    // collect post-commit notification actions so they won't be rolled back with the order tx
    List<Runnable> postCommitNotifications = new ArrayList<>();
        for (ThanhToanRequest ct : request.getChiTietDonHangList()) {
            BienTheSanPham bienThe = bienTheSanPhamRepository.findById(ct.getMaBienThe())
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy biến thể sản phẩm."));

            if (bienThe.getSoLuongTon() < ct.getSoLuong()) {
                throw new AppException(400, "Sản phẩm " + bienThe.getSku() + " không đủ số lượng tồn kho.");
            }
            // Lưu giá trị trước khi trừ để kiểm tra xem có vượt ngưỡng cảnh báo hay về 0 không
            Integer beforeStock = bienThe.getSoLuongTon();
            Integer afterStock = beforeStock - ct.getSoLuong();
            bienThe.setSoLuongTon(afterStock);

            // Nếu sau khi trừ xuống bằng 0 => tạo thông báo hết hàng (deferred until after commit)
            try {
                if (afterStock <= 0) {
                    Integer maSanPham = bienThe.getSanPham() != null ? bienThe.getSanPham().getMaSanPham() : null;
                    String tenSanPham = bienThe.getSanPham() != null ? bienThe.getSanPham().getTenSanPham() : bienThe.getSku();
                    if (maSanPham != null) {
                        Integer finalMaSanPham = maSanPham;
                        String finalTenSanPham = tenSanPham;
                        postCommitNotifications.add(() -> {
                            try { thongBaoService.taoThongBaoHetHang(finalMaSanPham, finalTenSanPham); } catch (Exception e) { System.err.println("Lỗi publish het hang: " + e.getMessage()); }
                        });
                    } else {
                        String finalTenSanPham = tenSanPham;
                        postCommitNotifications.add(() -> {
                            try { thongBaoService.taoThongBaoCanhBaoTonKho(null, finalTenSanPham, afterStock); } catch (Exception e) { System.err.println("Lỗi publish canh bao ton kho: " + e.getMessage()); }
                        });
                    }
                } else if (beforeStock > bienThe.getMucTonToiThieu() && afterStock <= bienThe.getMucTonToiThieu()) {
                    Integer maSanPham = bienThe.getSanPham() != null ? bienThe.getSanPham().getMaSanPham() : null;
                    String tenSanPham = bienThe.getSanPham() != null ? bienThe.getSanPham().getTenSanPham() : bienThe.getSku();
                    Integer finalMaSanPham = maSanPham;
                    String finalTenSanPham = tenSanPham;
                    postCommitNotifications.add(() -> {
                        try { thongBaoService.taoThongBaoCanhBaoTonKho(finalMaSanPham, finalTenSanPham, afterStock); } catch (Exception e) { System.err.println("Lỗi publish canh bao ton kho: " + e.getMessage()); }
                    });
                }
            } catch (Exception ex) {
                // don't fail the order if notification scheduling fails
                System.err.println("Không thể lên lịch thông báo tồn kho: " + ex.getMessage());
            }

            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setDonHang(donHang);
            chiTiet.setBienThe(bienThe);
            chiTiet.setSoLuong(ct.getSoLuong());
            chiTiet.setDonGiaGoc(bienThe.getGiaBan());
            chiTiet.setDonGiaThucTe(bienThe.getGiaBan());
            chiTietList.add(chiTiet);
        }
        donHang.setChiTietDonHangs(chiTietList);

        // 8. Lưu tất cả thay đổi
        DonHang savedDonHang = donHangRepository.save(donHang);

        // Schedule creation/publish of notifications after the order transaction commits
        if (!postCommitNotifications.isEmpty() || (savedDonHang != null && savedDonHang.getMaDonHang() != null)) {
            final Integer maDonHangForNotif = savedDonHang != null ? savedDonHang.getMaDonHang() : null;
            try {
                if (TransactionSynchronizationManager.isSynchronizationActive()) {
                    System.out.println("[DonHangService] Đăng ký thông báo sau khi commit cho đơn: " + maDonHangForNotif);
                    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            // run collected notifications
                            for (Runnable r : postCommitNotifications) {
                                try { r.run(); } catch (Exception e) { System.err.println("Lỗi khi thực hiện thông báo sau commit: " + e.getMessage()); }
                            }
                            // notify about new order
                            if (maDonHangForNotif != null) {
                                try { thongBaoService.taoThongBaoDonHangMoi(maDonHangForNotif); } catch (Exception e) { System.err.println("Lỗi tạo thông báo đơn hàng mới sau commit: " + e.getMessage()); }
                            }
                        }
                    });
                } else {
                    // If no transaction active, run notifications immediately
                    System.out.println("[DonHangService] TransactionSynchronization not active - thực hiện thông báo ngay lập tức for order: " + maDonHangForNotif);
                    for (Runnable r : postCommitNotifications) {
                        try { r.run(); } catch (Exception e) { System.err.println("Lỗi khi thực hiện thông báo trực tiếp: " + e.getMessage()); }
                    }
                    if (maDonHangForNotif != null) {
                        try { thongBaoService.taoThongBaoDonHangMoi(maDonHangForNotif); } catch (Exception e) { System.err.println("Lỗi tạo thông báo đơn hàng mới trực tiếp: " + e.getMessage()); }
                    }
                }
            } catch (Exception ex) {
                // If registration fails, attempt immediate execution as a fallback
                System.err.println("[DonHangService] Không thể đăng ký TransactionSynchronization, fallback thực hiện thông báo trực tiếp: " + ex.getMessage());
                for (Runnable r : postCommitNotifications) {
                    try { r.run(); } catch (Exception e) { System.err.println("Lỗi khi thực hiện thông báo fallback: " + e.getMessage()); }
                }
                if (maDonHangForNotif != null) {
                    try { thongBaoService.taoThongBaoDonHangMoi(maDonHangForNotif); } catch (Exception e) { System.err.println("Lỗi tạo thông báo đơn hàng mới fallback: " + e.getMessage()); }
                }
            }
        }

        return mapToResponse(savedDonHang);
    }

    @Override
    public DonHangResponse getDonHangById(Integer id) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + id));
        return mapToResponse(donHang);
    }

    @Override
    public List<DonHangResponse> getTatCaDonHang() {
        return donHangRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DonHangResponse> getDonHangByKhachHang(Integer maKhachHang) {
        return donHangRepository.findByKhachHang(maKhachHang).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void capNhatTrangThai(Integer id, String trangThai) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + id));
        donHang.setTrangThaiDonHang(trangThai);
        donHangRepository.save(donHang);

        // Tạo thông báo khi trạng thái đơn hàng thay đổi
        try {
            thongBaoService.taoThongBaoThayDoiTrangThai(id, trangThai);
        } catch (Exception ex) {
            System.err.println("Không thể tạo thông báo thay đổi trạng thái đơn hàng: " + ex.getMessage());
        }
    }

    @Override
    public ThongKeBanHangResponse thongKeBanHang() {
        long tongDonHang = donHangRepository.count();
        long choXuLy = donHangRepository.countByTrangThaiDonHang("CHO_XU_LY");
        long hoanThanh = donHangRepository.countByTrangThaiDonHang("HOAN_THANH");
        BigDecimal doanhThu = donHangRepository.sumThanhTienByTrangThaiDonHang("HOAN_THANH");

        ThongKeBanHangResponse response = new ThongKeBanHangResponse();
        response.setTongDonHang(tongDonHang);
        response.setChoXuLy(choXuLy);
        response.setHoanThanh(hoanThanh);
        response.setDoanhThuHomNay(doanhThu != null ? doanhThu : BigDecimal.ZERO);
        return response;
    }

    @Override
    @Transactional
    public void xoaDonHang(Integer id) {
        DonHang donHang = donHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + id));

        // Tạo thông báo rằng đơn hàng đã bị hủy/ xóa (ký hiệu hủy)
        try {
            thongBaoService.taoThongBaoDonHangBiHuy(id, "Đơn hàng đã bị hủy/xóa.");
        } catch (Exception ex) {
            System.err.println("Không thể tạo thông báo hủy đơn hàng: " + ex.getMessage());
        }

        // Hoàn kho, hoàn điểm, hoàn voucher...
        // (Cần thêm logic chi tiết ở đây nếu trạng thái đơn hàng không phải là đã hủy)

        // Xóa các bản ghi phụ thuộc trước
        // Repository interfaces don't expose deleteByDonHang_MaDonHang; fetch the
        // related entities and delete them via repository.deleteAll(...) to keep
        // behavior explicit and avoid adding custom repository methods.
        List<GiaoDichThanhToan> giaoDichList = giaoDichThanhToanRepository.findByDonHang_MaDonHang(id);
        if (giaoDichList != null && !giaoDichList.isEmpty()) {
            giaoDichThanhToanRepository.deleteAll(giaoDichList);
        }

        List<LichSuTrangThaiDonHang> lichSuList = lichSuTrangThaiDonHangRepository.findByDonHangOrderByThoiGianThayDoiDesc(id);
        if (lichSuList != null && !lichSuList.isEmpty()) {
            lichSuTrangThaiDonHangRepository.deleteAll(lichSuList);
        }

        // Jpa tự xử lý xóa ChiTietDonHang nhờ CascadeType.ALL

        // Cuối cùng xóa đơn hàng
        donHangRepository.delete(donHang);
    }

    private DonHangResponse mapToResponse(DonHang donHang) {
        DonHangResponse response = new DonHangResponse();
        response.setMaDonHang(donHang.getMaDonHang());
        if (donHang.getKhachHang() != null) {
            response.setTenKhachHang(donHang.getKhachHang().getHoTen());
            response.setSoDienThoaiKhachHang(donHang.getKhachHang().getSoDienThoai());
            response.setEmailKhachHang(donHang.getKhachHang().getEmail());
        }
        response.setNgayDatHang(donHang.getNgayDatHang());
        if (donHang.getNgayDatHang() != null) {
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            response.setNgayDatHangStr(donHang.getNgayDatHang().format(fmt));
        }
        response.setTrangThai(donHang.getTrangThaiDonHang());
    response.setDiaChiGiaoHang(donHang.getDiaChiGiaoHang());
        response.setTongTienGoc(donHang.getTongTienGoc());
        response.setGiamGiaVoucher(donHang.getGiamGiaVoucher());
        response.setDiemThuongSuDung(donHang.getDiemThuongSuDung());
        response.setGiamGiaDiemThuong(donHang.getGiamGiaDiemThuong());
        response.setGiamGiaVip(donHang.getGiamGiaVip());
    response.setDiemThuongNhanDuoc(donHang.getDiemThuongNhanDuoc());
    // Compute total discount (VIP + Voucher + Điểm) for convenience on frontend
    java.math.BigDecimal vipDisc = donHang.getGiamGiaVip() != null ? donHang.getGiamGiaVip() : java.math.BigDecimal.ZERO;
    java.math.BigDecimal vouDisc = donHang.getGiamGiaVoucher() != null ? donHang.getGiamGiaVoucher() : java.math.BigDecimal.ZERO;
    java.math.BigDecimal diemDisc = donHang.getGiamGiaDiemThuong() != null ? donHang.getGiamGiaDiemThuong() : java.math.BigDecimal.ZERO;
    response.setTongGiamGia(vipDisc.add(vouDisc).add(diemDisc));
        response.setChiPhiDichVu(donHang.getPhiGiaoHang());
        response.setThanhTien(donHang.getThanhTien());
        if (donHang.getVoucher() != null) {
            response.setVoucherCode(donHang.getVoucher().getMaCode());
        }

        if (donHang.getChiTietDonHangs() != null) {
            List<ChiTietDonHangResponse> chiTietList = donHang.getChiTietDonHangs().stream()
                    .map(ct -> {
                        BienTheSanPham bienThe = ct.getBienThe();
                        SanPham sanPham = bienThe != null ? bienThe.getSanPham() : null;

                        return new ChiTietDonHangResponse(
                                sanPham != null ? sanPham.getTenSanPham() : "N/A",
                                bienThe != null ? bienThe.getSku() : "N/A",
                                ct.getSoLuong(),
                                ct.getDonGiaGoc(),
                                ct.getDonGiaThucTe().multiply(BigDecimal.valueOf(ct.getSoLuong())));
                    }).collect(Collectors.toList());
            response.setChiTietDonHangList(chiTietList);
        }

        return response;
    }
}