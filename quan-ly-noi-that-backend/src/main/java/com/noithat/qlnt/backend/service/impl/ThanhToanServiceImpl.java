package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.ThemGiaoDichRequest;
import com.noithat.qlnt.backend.dto.request.ThongTinGiaoHangRequest;
import com.noithat.qlnt.backend.dto.response.ThanhToanChiTietResponse;
import com.noithat.qlnt.backend.dto.response.ThanhToanResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeThanhToanResponse;
import com.noithat.qlnt.backend.dto.request.TaoHoaDonRequest;
import com.noithat.qlnt.backend.dto.request.ThanhToanRequest;
import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.ChiTietDonHang;
import com.noithat.qlnt.backend.entity.DonHang;
import com.noithat.qlnt.backend.entity.GiaoDichThanhToan;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.entity.Voucher;
import com.noithat.qlnt.backend.repository.GiaoDichThanhToanRepository;
import com.noithat.qlnt.backend.repository.DonHangRepository;
import com.noithat.qlnt.backend.repository.VoucherRepository;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.service.ThanhToanService;
import com.noithat.qlnt.backend.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThanhToanServiceImpl implements ThanhToanService {

    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    private final DonHangRepository donHangRepository;
    private final com.noithat.qlnt.backend.repository.KhachHangRepository khachHangRepository;
    private final VoucherRepository voucherRepository;
    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final HoaDonService hoaDonService;
    private final com.noithat.qlnt.backend.service.VipBenefitProcessor vipBenefitProcessor;
    

    @Override
    public ThongKeThanhToanResponse getThongKe() {
        long daThanhToan = giaoDichThanhToanRepository.countByTrangThai("Hoàn thành");
        long choXuLy = giaoDichThanhToanRepository.countByTrangThai("Chờ xử lý");
        BigDecimal tongDoanhThu = giaoDichThanhToanRepository.sumSoTienByTrangThai("Hoàn thành");

        ThongKeThanhToanResponse response = new ThongKeThanhToanResponse();
        response.setSoGiaoDichDaThanhToan(daThanhToan);
        response.setSoGiaoDichChoXuLy(choXuLy);
        response.setTongDoanhThu(tongDoanhThu == null ? BigDecimal.ZERO : tongDoanhThu);
        response.setTongPhiGiaoDich(BigDecimal.ZERO); // Tạm thời, cần logic tính phí riêng
        
        return response;
    }

   @Override
    public List<ThanhToanResponse> getAllThanhToan(String trangThai, String phuongThuc) {
        // Gọi phương thức repository mới để thực hiện truy vấn lọc
        List<GiaoDichThanhToan> giaoDichList = giaoDichThanhToanRepository.findByFilters(trangThai, phuongThuc);
        
        // Logic map sang DTO vẫn giữ nguyên
        return giaoDichList.stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ThanhToanChiTietResponse getThanhToanById(Integer id) {
        GiaoDichThanhToan giaoDich = giaoDichThanhToanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch với ID: " + id));
        return mapToChiTietResponse(giaoDich); // Gọi hàm map cho chi tiết
    }

    @Override
    @Transactional
    public ThanhToanResponse updateTrangThai(Integer id, String newStatus) {
        GiaoDichThanhToan giaoDich = giaoDichThanhToanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch với ID: " + id));

        // Chỉ cập nhật trạng thái của chính giao dịch này
        giaoDich.setTrangThai(newStatus);
        
        // Không còn logic cập nhật DonHang ở đây nữa
        
        GiaoDichThanhToan updatedGiaoDich = giaoDichThanhToanRepository.save(giaoDich);
        return mapToListResponse(updatedGiaoDich);
    }

    /**
     * Hàm helper để chuyển đổi sang DTO cho DANH SÁCH.
     */
    private ThanhToanResponse mapToListResponse(GiaoDichThanhToan giaoDich) {
        ThanhToanResponse response = new ThanhToanResponse();
        response.setMaGiaoDich(giaoDich.getMaGiaoDich());
        response.setSoTien(giaoDich.getSoTien());
        response.setPhuongThuc(giaoDich.getPhuongThuc());
        response.setTrangThai(giaoDich.getTrangThai());
        response.setNgayGiaoDich(giaoDich.getNgayGiaoDich());

        DonHang donHang = giaoDich.getDonHang();
        if (donHang != null) {
            response.setMaDonHang("ORD" + String.format("%03d", donHang.getMaDonHang()));
            if (donHang.getKhachHang() != null) {
                response.setTenKhachHang(donHang.getKhachHang().getHoTen());
            }
            if (donHang.getNhanVienDuyet() != null) {
                response.setNguoiXuLy(donHang.getNhanVienDuyet().getHoTen());
            } else {
                response.setNguoiXuLy("Hệ thống");
            }
        }
        return response;
    }

    /**
     * Hàm helper để chuyển đổi sang DTO cho CHI TIẾT.
     */
    private ThanhToanChiTietResponse mapToChiTietResponse(GiaoDichThanhToan giaoDich) {
        ThanhToanChiTietResponse response = new ThanhToanChiTietResponse();

        response.setMaThanhToan("PAY" + String.format("%03d", giaoDich.getMaGiaoDich()));
        response.setSoTien(giaoDich.getSoTien());
        response.setPhiGiaoDich(BigDecimal.ZERO); // Tạm tính
        response.setSoTienThucNhan(giaoDich.getSoTien()); // Tạm tính
        response.setTrangThai(giaoDich.getTrangThai());
        response.setThoiGianGiaoDich(giaoDich.getNgayGiaoDich());
        // response.setMaGiaoDichNgoai(giaoDich.getMaGiaoDichNgoai()); // Cần thêm trường này vào Entity
        response.setPhuongThuc(giaoDich.getPhuongThuc());

        DonHang donHang = giaoDich.getDonHang();
        if (donHang != null) {
            response.setMaDonHang("ORD" + String.format("%03d", donHang.getMaDonHang()));
            if (donHang.getNhanVienDuyet() != null) {
                response.setNguoiXuLy(donHang.getNhanVienDuyet().getHoTen());
            } else {
                response.setNguoiXuLy("Hệ thống");
            }
        }
        return response;
    }
     @Override
    @Transactional
    public ThanhToanChiTietResponse themMoiGiaoDich(ThemGiaoDichRequest request) {
        // 1. Tìm đơn hàng tương ứng
        DonHang donHang = donHangRepository.findById(request.getMaDonHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + request.getMaDonHang()));

        // 2. Tạo đối tượng GiaoDichThanhToan mới
        GiaoDichThanhToan newGiaoDich = new GiaoDichThanhToan();
        
        // 3. Map dữ liệu từ request DTO sang Entity
        newGiaoDich.setDonHang(donHang);
        newGiaoDich.setSoTien(request.getSoTien());
        newGiaoDich.setPhuongThuc(request.getPhuongThuc());
        newGiaoDich.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "Hoàn thành"); // Mặc định là Hoàn thành
        newGiaoDich.setNgayGiaoDich(LocalDateTime.now());
        // newGiaoDich.setMaGiaoDichNgoai(request.getMaGiaoDichNganHang()); // Cần thêm trường này vào Entity

        // 4. Lưu giao dịch mới vào DB
        GiaoDichThanhToan savedGiaoDich = giaoDichThanhToanRepository.save(newGiaoDich);

        
        return mapToChiTietResponse(savedGiaoDich);
    }
     @Override
    public List<ThanhToanResponse> getByDonHang(Integer maDonHang) {
        // Gọi phương thức trong repository để tìm các giao dịch theo mã đơn hàng
        return giaoDichThanhToanRepository.findByDonHang_MaDonHang(maDonHang)
                .stream()
                // Tái sử dụng hàm mapToListResponse bạn đã có để chuyển đổi sang DTO
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ThanhToanResponse> xemGioHang(List<ThanhToanRequest> danhSachSanPham) {
        List<ThanhToanResponse> responseList = new ArrayList<>();

        for (ThanhToanRequest item : danhSachSanPham) {
            BienTheSanPham bienThe = bienTheSanPhamRepository.findById(item.getMaBienThe())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm"));

            BigDecimal tongTien = bienThe.getGiaBan().multiply(BigDecimal.valueOf(item.getSoLuong()));

            ThanhToanResponse resp = new ThanhToanResponse();
            resp.setMaDonHang("CH-" + System.currentTimeMillis());
            resp.setTenKhachHang("Giỏ hàng tạm");
            resp.setSoTien(tongTien);
            resp.setPhuongThuc("Chưa chọn");
            resp.setTrangThai("Xem trước giỏ hàng");
            resp.setNguoiXuLy(null);

            responseList.add(resp);
        }

        return responseList;
    }

    /**
     * Bước 2: Xử lý thông tin giao hàng (bao gồm điểm thưởng + phí dịch vụ)
     */
    @Override
    public ThanhToanResponse thongTinGiaoHang(ThanhToanRequest request) {
        KhachHang khachHang = khachHangRepository.findById(request.getMaKhachHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + request.getMaKhachHang()));

        BigDecimal tongTienGoc = request.getTongTienGoc();
        BigDecimal chiPhiDichVu = BigDecimal.ZERO;

        // Xác định chi phí dựa theo phương thức giao hàng
        switch (request.getPhuongThucGiaoHang()) {
            case "Nhanh":
                chiPhiDichVu = new BigDecimal("30000");
                break;
            case "Tiết kiệm":
                chiPhiDichVu = new BigDecimal("15000");
                break;
            case "Nhận tại cửa hàng":
                chiPhiDichVu = BigDecimal.ZERO;
                break;
            default:
                throw new RuntimeException("Phương thức giao hàng không hợp lệ");
        }

        // Tính điểm thưởng được sử dụng (nếu có)
        BigDecimal giaTriDiem = BigDecimal.ZERO;
        if (request.getDiemSuDung() != null && request.getDiemSuDung() > 0) {
            int diemCoTheDung = Math.min(request.getDiemSuDung(), khachHang.getDiemThuong());
            giaTriDiem = BigDecimal.valueOf(diemCoTheDung * 1000L); // ví dụ 1 điểm = 1000đ
        }

        // Tính thành tiền cuối cùng
        BigDecimal thanhTien = tongTienGoc.add(chiPhiDichVu).subtract(giaTriDiem);

        ThanhToanResponse response = new ThanhToanResponse();
        response.setTongTienGoc(tongTienGoc);
        response.setChiPhiDichVu(chiPhiDichVu);
        response.setGiaTriDiem(giaTriDiem);
        response.setThanhTien(thanhTien);
        response.setDiaChiGiaoHang(request.getDiaChiGiaoHang());
        response.setPhuongThucGiaoHang(request.getPhuongThucGiaoHang());
        response.setDiemSuDung(request.getDiemSuDung());

        return response;
    }

    @Override
    @Transactional
    public ThanhToanResponse taoDonHangTuUser(ThongTinGiaoHangRequest request) {
        KhachHang khachHang = khachHangRepository.findById(request.getMaKhachHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng."));

        // Tạo đơn hàng
        DonHang donHang = new DonHang();
        donHang.setKhachHang(khachHang);
        donHang.setNgayDatHang(LocalDateTime.now());
        donHang.setTrangThai("Chờ xác nhận");
        donHang.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        donHang.setGhiChu(request.getGhiChu());
        donHang.setDiaChiGiaoHang(request.getDiaChiGiaoHang());

        // Phương thức giao hàng
        donHang.setPhuongThucGiaoHang(request.getPhuongThucGiaoHang());

        // Voucher (nếu có)
        BigDecimal giamGiaVoucher = BigDecimal.ZERO;
        if (request.getMaVoucher() != null) {
            Voucher voucher = voucherRepository.findById(request.getMaVoucher())
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại."));
            donHang.setVoucher(voucher);
            giamGiaVoucher = voucher.getGiaTriGiam() != null ? voucher.getGiaTriGiam() : BigDecimal.ZERO;
        }

        // Điểm thưởng (nếu có)
        BigDecimal giaTriDiem = BigDecimal.ZERO;
        if (request.getDiemThuongSuDung() != null && request.getDiemThuongSuDung() > 0) {
            int diemSuDung = request.getDiemThuongSuDung();
            giaTriDiem = BigDecimal.valueOf(diemSuDung * 1000); // ví dụ: 1 điểm = 1000đ
            khachHang.setDiemThuong(khachHang.getDiemThuong() - diemSuDung);
            donHang.setDiemSuDung(diemSuDung);
            donHang.setGiaTriDiem(giaTriDiem);
        }

        // Chi tiết đơn hàng
        BigDecimal tongTienGoc = BigDecimal.ZERO;
        List<ChiTietDonHang> chiTietList = new ArrayList<>();

        List<com.noithat.qlnt.backend.dto.request.ThanhToanRequest> ctRequests = request.getChiTietDonHangList();
        if (ctRequests == null) {
            ctRequests = Collections.emptyList();
        }

        for (var ct : ctRequests) {
            BienTheSanPham bienThe = bienTheSanPhamRepository.findById(ct.getMaBienThe())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể sản phẩm."));

            ChiTietDonHang chiTiet = new ChiTietDonHang();
            chiTiet.setBienThe(bienThe);
            chiTiet.setSoLuong(ct.getSoLuong());
            chiTiet.setDonGiaThucTe(bienThe.getGiaBan());
            chiTiet.setDonHang(donHang);

            BigDecimal thanhTien = bienThe.getGiaBan().multiply(BigDecimal.valueOf(ct.getSoLuong()));
            tongTienGoc = tongTienGoc.add(thanhTien);

            chiTietList.add(chiTiet);
        }

        // Tính thành tiền cuối cùng
        // Determine original shipping/service cost from request's phuongThucGiaoHang
        BigDecimal originalShippingCost = BigDecimal.ZERO;
        String phuongThucGiaoHang = request.getPhuongThucGiaoHang();
        if (phuongThucGiaoHang != null) {
            switch (phuongThucGiaoHang) {
                case "Nhanh": originalShippingCost = new BigDecimal("30000"); break;
                case "Tiết kiệm": originalShippingCost = new BigDecimal("15000"); break;
                case "Nhận tại cửa hàng": originalShippingCost = BigDecimal.ZERO; break;
                default: originalShippingCost = BigDecimal.ZERO; break;
            }
        }

        // Apply VIP benefits for shipping (server authoritative)
        boolean mienPhiVanChuyenVip = vipBenefitProcessor.hasFreshipping(khachHang);
        BigDecimal chiPhiDichVuSauVip = vipBenefitProcessor.calculateShippingCostAfterVipBenefit(khachHang, originalShippingCost);
        donHang.setMienPhiVanChuyen(mienPhiVanChuyenVip);
        donHang.setChiPhiDichVu(chiPhiDichVuSauVip);

        BigDecimal thanhTienCuoi = tongTienGoc
                .subtract(giamGiaVoucher)
                .subtract(giaTriDiem)
                .add(chiPhiDichVuSauVip);

        donHang.setTongTienGoc(tongTienGoc);
        donHang.setThanhTien(thanhTienCuoi);
        donHang.setGiamGiaVoucher(giamGiaVoucher);
        donHang.setChiTietDonHangs(chiTietList);

        DonHang savedDonHang = donHangRepository.save(donHang);

        TaoHoaDonRequest taoHoaDonRequest = new TaoHoaDonRequest();
        taoHoaDonRequest.setMaDonHang(savedDonHang.getMaDonHang());
        
        // Gán một nhân viên hệ thống mặc định cho các hóa đơn tạo tự động.
        // Cần đảm bảo có một nhân viên với ID=1 trong database của bạn.
        final Integer MA_NHAN_VIEN_HE_THONG = 1;
        taoHoaDonRequest.setMaNhanVienXuat(MA_NHAN_VIEN_HE_THONG);

        // Gọi service để tạo và lưu hóa đơn vào database.
        // Nhờ có @Transactional, nếu bước này lỗi, đơn hàng cũng sẽ không được tạo.
        hoaDonService.taoHoaDon(taoHoaDonRequest);
        
        // ===== PHẦN 3: TRẢ VỀ KẾT QUẢ CHO NGƯỜI DÙNG =====
        
        // Trả về thông tin xác nhận đơn hàng đã được tạo thành công
        ThanhToanResponse response = new ThanhToanResponse();
        response.setMaDonHang(String.valueOf(savedDonHang.getMaDonHang()));
        // response.setThanhTien(savedDonHang.getThanhTien()); // Giả sử DTO có các trường này
        // response.setTrangThai(savedDonHang.getTrangThai());
        return new ThanhToanResponse(
                donHang.getMaDonHang(),
                donHang.getThanhTien(),
                donHang.getTrangThai(),
                donHang.getPhuongThucThanhToan()
        );
    }
}