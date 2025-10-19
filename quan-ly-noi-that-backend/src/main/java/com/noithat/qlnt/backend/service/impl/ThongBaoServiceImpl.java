package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.ThongBaoRequest;
import com.noithat.qlnt.backend.dto.response.ThongBaoResponse;
import com.noithat.qlnt.backend.entity.ThongBao;
import com.noithat.qlnt.backend.entity.DonHang;
import com.noithat.qlnt.backend.exception.ResourceNotFoundException;
import com.noithat.qlnt.backend.repository.ThongBaoRepository;
import com.noithat.qlnt.backend.repository.DonHangRepository;
import com.noithat.qlnt.backend.service.IThongBaoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation cho Thông báo
 */
@Service
public class ThongBaoServiceImpl implements IThongBaoService {
    
    private final ThongBaoRepository thongBaoRepository;
    private final DonHangRepository donHangRepository;
    
    public ThongBaoServiceImpl(ThongBaoRepository thongBaoRepository,
                              DonHangRepository donHangRepository) {
        this.thongBaoRepository = thongBaoRepository;
        this.donHangRepository = donHangRepository;
    }
    
    // ==================== CRUD Operations ====================
    
    @Override
    public List<ThongBao> getAll() {
        return thongBaoRepository.findByNgayXoaIsNullOrderByNgayTaoDesc();
    }
    
    @Override
    public List<ThongBaoResponse> getAllWithResponse() {
        return getAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public ThongBao getById(Integer id) {
        ThongBao thongBao = thongBaoRepository.findByIdAndNotDeleted(id);
        if (thongBao == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông báo với ID: " + id);
        }
        return thongBao;
    }
    
    @Override
    public ThongBaoResponse getByIdWithResponse(Integer id) {
        return mapToResponse(getById(id));
    }
    
    @Override
    @Transactional
    public ThongBao create(ThongBaoRequest request) {
        ThongBao thongBao = ThongBao.builder()
                .loai(request.getLoai())
                .tieuDe(request.getTieuDe())
                .noiDung(request.getNoiDung())
                .nguoiNhanId(request.getNguoiNhanId())
                .loaiNguoiNhan(request.getLoaiNguoiNhan())
                .duongDanHanhDong(request.getDuongDanHanhDong())
                .doUuTien(request.getDoUuTien() != null ? request.getDoUuTien() : "normal")
                .lienKetId(request.getLienKetId())
                .loaiLienKet(request.getLoaiLienKet())
                .build();
        
        return thongBaoRepository.save(thongBao);
    }
    
    @Override
    @Transactional
    public ThongBaoResponse createWithResponse(ThongBaoRequest request) {
        ThongBao created = create(request);
        return mapToResponse(created);
    }
    
    @Override
    @Transactional
    public ThongBao update(Integer id, ThongBaoRequest request) {
        ThongBao existing = getById(id);
        
        // Update fields
        if (request.getLoai() != null) existing.setLoai(request.getLoai());
        if (request.getTieuDe() != null) existing.setTieuDe(request.getTieuDe());
        if (request.getNoiDung() != null) existing.setNoiDung(request.getNoiDung());
        if (request.getNguoiNhanId() != null) existing.setNguoiNhanId(request.getNguoiNhanId());
        if (request.getLoaiNguoiNhan() != null) existing.setLoaiNguoiNhan(request.getLoaiNguoiNhan());
        if (request.getDuongDanHanhDong() != null) existing.setDuongDanHanhDong(request.getDuongDanHanhDong());
        if (request.getDoUuTien() != null) existing.setDoUuTien(request.getDoUuTien());
        if (request.getLienKetId() != null) existing.setLienKetId(request.getLienKetId());
        if (request.getLoaiLienKet() != null) existing.setLoaiLienKet(request.getLoaiLienKet());
        
        existing.setNgayCapNhat(LocalDateTime.now());
        
        return thongBaoRepository.save(existing);
    }
    
    @Override
    @Transactional
    public void delete(Integer id) {
        ThongBao thongBao = getById(id);
        thongBao.softDelete();
        thongBaoRepository.save(thongBao);
    }
    
    @Override
    @Transactional
    public void permanentDelete(Integer id) {
        ThongBao thongBao = thongBaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo với ID: " + id));
        thongBaoRepository.delete(thongBao);
    }
    
    // ==================== Business Logic ====================
    
    @Override
    public List<ThongBao> getNotificationsForUser(Integer nguoiNhanId, String loaiNguoiNhan) {
        if (nguoiNhanId == null) {
            // Nếu không có ID, chỉ lấy thông báo cho ALL
            return thongBaoRepository.findByLoaiNguoiNhanAndNgayXoaIsNullOrderByNgayTaoDesc("ALL");
        }
        return thongBaoRepository.findNotificationsForUser(nguoiNhanId, loaiNguoiNhan);
    }
    
    @Override
    public List<ThongBaoResponse> getNotificationsForUserWithResponse(Integer nguoiNhanId, String loaiNguoiNhan) {
        return getNotificationsForUser(nguoiNhanId, loaiNguoiNhan).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void danhDauDaDoc(Integer id) {
        ThongBao thongBao = getById(id);
        thongBao.markAsRead();
        thongBaoRepository.save(thongBao);
    }
    
    @Override
    @Transactional
    public void danhDauTatCaDaDoc(Integer nguoiNhanId, String loaiNguoiNhan) {
        if (nguoiNhanId == null) {
            // Nếu không có ID, đánh dấu tất cả thông báo ALL
            loaiNguoiNhan = "ALL";
            nguoiNhanId = 0; // Dummy value
        }
        int updated = thongBaoRepository.markAllAsReadForUser(nguoiNhanId, loaiNguoiNhan, LocalDateTime.now());
        System.out.println("[ThongBaoService] Đã đánh dấu " + updated + " thông báo là đã đọc");
    }
    
    @Override
    public long countChuaDoc(Integer nguoiNhanId, String loaiNguoiNhan) {
        if (nguoiNhanId == null) {
            return thongBaoRepository.countByLoaiNguoiNhanAndDaDocFalseAndNgayXoaIsNull("ALL");
        }
        return thongBaoRepository.countUnreadForUser(nguoiNhanId, loaiNguoiNhan);
    }
    
    @Override
    public List<ThongBao> getChuaDoc(Integer nguoiNhanId, String loaiNguoiNhan) {
        if (nguoiNhanId == null) {
            return thongBaoRepository.findByLoaiNguoiNhanAndNgayXoaIsNullOrderByNgayTaoDesc("ALL")
                    .stream()
                    .filter(tb -> !tb.getDaDoc())
                    .collect(Collectors.toList());
        }
        return thongBaoRepository.findUnreadNotificationsForUser(nguoiNhanId, loaiNguoiNhan);
    }
    
    @Override
    public List<ThongBao> getByLoai(String loai) {
        return thongBaoRepository.findByLoaiAndNgayXoaIsNullOrderByNgayTaoDesc(loai);
    }
    
    @Override
    public List<ThongBao> getByLoaiForUser(String loai, Integer nguoiNhanId, String loaiNguoiNhan) {
        if (nguoiNhanId == null) {
            return getByLoai(loai);
        }
        return thongBaoRepository.findByLoaiForUser(loai, nguoiNhanId, loaiNguoiNhan);
    }
    
    @Override
    public List<ThongBao> getHighPriorityUnread(Integer nguoiNhanId, String loaiNguoiNhan) {
        if (nguoiNhanId == null) {
            return thongBaoRepository.findByDoUuTienAndNgayXoaIsNullOrderByNgayTaoDesc("high")
                    .stream()
                    .filter(tb -> !tb.getDaDoc())
                    .collect(Collectors.toList());
        }
        return thongBaoRepository.findHighPriorityUnreadForUser(nguoiNhanId, loaiNguoiNhan);
    }
    
    // ==================== Auto-create Notifications ====================
    
    @Override
    @Transactional
    public void taoThongBaoDonHangMoi(Integer maDonHang) {
        try {
            DonHang donHang = donHangRepository.findById(maDonHang).orElse(null);
            if (donHang == null) {
                System.err.println("[ThongBaoService] Không tìm thấy đơn hàng ID: " + maDonHang);
                return;
            }
            
            String tenKhachHang = donHang.getKhachHang() != null ? 
                    donHang.getKhachHang().getHoTen() : "Khách vãng lai";
            
            ThongBaoRequest request = new ThongBaoRequest();
            request.setLoai("order");
            request.setTieuDe("Đơn hàng mới");
            request.setNoiDung("Đơn hàng #" + maDonHang + " từ khách hàng " + tenKhachHang + " đã được tạo");
            request.setLoaiNguoiNhan("ALL");
            request.setDuongDanHanhDong("/admin/don-hang/" + maDonHang);
            request.setDoUuTien("high");
            request.setLienKetId(maDonHang);
            request.setLoaiLienKet("DON_HANG");
            
            create(request);
            System.out.println("[ThongBaoService] Đã tạo thông báo đơn hàng mới: " + maDonHang);
        } catch (Exception e) {
            System.err.println("[ThongBaoService] Lỗi khi tạo thông báo đơn hàng: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Override
    @Transactional
    public void taoThongBaoCanhBaoTonKho(Integer maSanPham, String tenSanPham, Integer soLuongTon) {
        try {
            ThongBaoRequest request = new ThongBaoRequest();
            request.setLoai("warning");
            request.setTieuDe("Cảnh báo tồn kho");
            request.setNoiDung(tenSanPham + " sắp hết hàng (còn " + soLuongTon + " sản phẩm)");
            request.setLoaiNguoiNhan("ALL");
            request.setDuongDanHanhDong("/admin/san-pham/" + maSanPham);
            request.setDoUuTien("high");
            request.setLienKetId(maSanPham);
            request.setLoaiLienKet("SAN_PHAM");
            
            create(request);
            System.out.println("[ThongBaoService] Đã tạo cảnh báo tồn kho cho sản phẩm: " + tenSanPham);
        } catch (Exception e) {
            System.err.println("[ThongBaoService] Lỗi khi tạo cảnh báo tồn kho: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public void taoThongBaoHetHang(Integer maSanPham, String tenSanPham) {
        try {
            ThongBaoRequest request = new ThongBaoRequest();
            request.setLoai("error");
            request.setTieuDe("Hết hàng");
            request.setNoiDung(tenSanPham + " đã hết hàng");
            request.setLoaiNguoiNhan("ALL");
            request.setDuongDanHanhDong("/admin/san-pham/" + maSanPham);
            request.setDoUuTien("high");
            request.setLienKetId(maSanPham);
            request.setLoaiLienKet("SAN_PHAM");
            
            create(request);
        } catch (Exception e) {
            System.err.println("[ThongBaoService] Lỗi khi tạo thông báo hết hàng: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public void taoThongBaoKhachHangVIP(Integer maKhachHang, String tenKhachHang, String hangVipMoi) {
        try {
            ThongBaoRequest request = new ThongBaoRequest();
            request.setLoai("info");
            request.setTieuDe("Khách hàng VIP");
            request.setNoiDung("Khách hàng " + tenKhachHang + " đã đạt cấp " + hangVipMoi);
            request.setLoaiNguoiNhan("ALL");
            request.setDuongDanHanhDong("/admin/khach-hang/" + maKhachHang);
            request.setDoUuTien("medium");
            request.setLienKetId(maKhachHang);
            request.setLoaiLienKet("KHACH_HANG");
            
            create(request);
        } catch (Exception e) {
            System.err.println("[ThongBaoService] Lỗi khi tạo thông báo VIP: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public void taoThongBaoThanhToan(Integer maDonHang, String soTien) {
        try {
            ThongBaoRequest request = new ThongBaoRequest();
            request.setLoai("success");
            request.setTieuDe("Thanh toán thành công");
            request.setNoiDung("Đơn hàng #" + maDonHang + " đã thanh toán " + soTien);
            request.setLoaiNguoiNhan("ALL");
            request.setDuongDanHanhDong("/admin/don-hang/" + maDonHang);
            request.setDoUuTien("normal");
            request.setLienKetId(maDonHang);
            request.setLoaiLienKet("DON_HANG");
            
            create(request);
        } catch (Exception e) {
            System.err.println("[ThongBaoService] Lỗi khi tạo thông báo thanh toán: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public void taoThongBaoThayDoiTrangThai(Integer maDonHang, String trangThaiMoi) {
        try {
            ThongBaoRequest request = new ThongBaoRequest();
            request.setLoai("info");
            request.setTieuDe("Cập nhật trạng thái đơn hàng");
            request.setNoiDung("Đơn hàng #" + maDonHang + " đã chuyển sang trạng thái: " + trangThaiMoi);
            request.setLoaiNguoiNhan("ALL");
            request.setDuongDanHanhDong("/admin/don-hang/" + maDonHang);
            request.setDoUuTien("normal");
            request.setLienKetId(maDonHang);
            request.setLoaiLienKet("DON_HANG");
            
            create(request);
        } catch (Exception e) {
            System.err.println("[ThongBaoService] Lỗi khi tạo thông báo trạng thái: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public void taoThongBaoDonHangBiHuy(Integer maDonHang, String lyDo) {
        try {
            ThongBaoRequest request = new ThongBaoRequest();
            request.setLoai("warning");
            request.setTieuDe("Đơn hàng bị hủy");
            request.setNoiDung("Đơn hàng #" + maDonHang + " đã bị hủy. Lý do: " + lyDo);
            request.setLoaiNguoiNhan("ALL");
            request.setDuongDanHanhDong("/admin/don-hang/" + maDonHang);
            request.setDoUuTien("medium");
            request.setLienKetId(maDonHang);
            request.setLoaiLienKet("DON_HANG");
            
            create(request);
        } catch (Exception e) {
            System.err.println("[ThongBaoService] Lỗi khi tạo thông báo hủy đơn: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public ThongBao taoThongBaoTongQuat(String loai, String tieuDe, String noiDung, String loaiNguoiNhan, String doUuTien) {
        try {
            ThongBaoRequest request = new ThongBaoRequest();
            request.setLoai(loai);
            request.setTieuDe(tieuDe);
            request.setNoiDung(noiDung);
            request.setLoaiNguoiNhan(loaiNguoiNhan);
            request.setDoUuTien(doUuTien != null ? doUuTien : "normal");
            
            return create(request);
        } catch (Exception e) {
            System.err.println("[ThongBaoService] Lỗi khi tạo thông báo tổng quát: " + e.getMessage());
            throw e;
        }
    }
    
    // ==================== Maintenance ====================
    
    @Override
    @Transactional
    public int xoaThongBaoCu() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        int deleted = thongBaoRepository.softDeleteOldNotifications(LocalDateTime.now(), cutoffDate);
        System.out.println("[ThongBaoService] Đã soft delete " + deleted + " thông báo cũ (>30 ngày)");
        return deleted;
    }
    
    @Override
    @Transactional
    public int xoaVinhVienThongBaoCu() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        int deleted = thongBaoRepository.permanentlyDeleteOldNotifications(cutoffDate);
        System.out.println("[ThongBaoService] Đã xóa vĩnh viễn " + deleted + " thông báo (đã soft delete >90 ngày)");
        return deleted;
    }
    
    // ==================== Helper Methods ====================
    
    /**
     * Map Entity sang Response DTO
     */
    private ThongBaoResponse mapToResponse(ThongBao entity) {
        return ThongBaoResponse.builder()
                .id(entity.getMaThongBao())
                .loai(entity.getLoai())
                .tieuDe(entity.getTieuDe())
                .noiDung(entity.getNoiDung())
                .thoiGian(entity.getThoiGian())
                .daDoc(entity.getDaDoc())
                .nguoiNhanId(entity.getNguoiNhanId())
                .loaiNguoiNhan(entity.getLoaiNguoiNhan())
                .ngayTao(entity.getNgayTao())
                .duongDanHanhDong(entity.getDuongDanHanhDong())
                .doUuTien(entity.getDoUuTien())
                .lienKetId(entity.getLienKetId())
                .loaiLienKet(entity.getLoaiLienKet())
                .isHighPriority(entity.isHighPriority())
                .isForAll(entity.isForAll())
                .build();
    }
}
