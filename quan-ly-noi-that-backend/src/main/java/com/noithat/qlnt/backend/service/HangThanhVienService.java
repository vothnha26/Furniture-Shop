package com.noithat.qlnt.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.noithat.qlnt.backend.dto.request.HangThanhVienRequest;
import com.noithat.qlnt.backend.dto.response.HangThanhVienResponse;
import com.noithat.qlnt.backend.dto.HangThanhVienDto;
import com.noithat.qlnt.backend.entity.HangThanhVien;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.repository.HangThanhVienRepository;
import com.noithat.qlnt.backend.repository.KhachHangRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HangThanhVienService {

    @Autowired
    private HangThanhVienRepository hangThanhVienRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map màu sắc theo tên hạng
    private static final Map<String, String> HANG_COLORS = new HashMap<>();
    static {
        HANG_COLORS.put("Bronze", "#CD7F32");
        HANG_COLORS.put("Đồng", "#CD7F32");
        HANG_COLORS.put("Silver", "#C0C0C0");
        HANG_COLORS.put("Bạc", "#C0C0C0");
        HANG_COLORS.put("Gold", "#FFD700");
        HANG_COLORS.put("Vàng", "#FFD700");
        HANG_COLORS.put("Platinum", "#E5E4E2");
        HANG_COLORS.put("Bạch Kim", "#E5E4E2");
        HANG_COLORS.put("Diamond", "#B9F2FF");
        HANG_COLORS.put("Kim Cương", "#B9F2FF");
        HANG_COLORS.put("VIP", "#8A2BE2");
    }

    /**
     * Lấy tất cả hạng thành viên với phân trang
     */
    public Page<HangThanhVienResponse> getAllHangThanhVien(Pageable pageable) {
        Page<HangThanhVien> hangPage = hangThanhVienRepository.findAll(pageable);
        return hangPage.map(this::convertToResponse);
    }

    /**
     * Lấy tất cả hạng thành viên không phân trang
     */
    public List<HangThanhVienResponse> getAllHangThanhVien() {
        List<HangThanhVien> hangList = hangThanhVienRepository.findAllByOrderByDiemToiThieuAsc();
        return hangList.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy hạng thành viên theo ID
     */
    public HangThanhVienResponse getHangThanhVienById(Integer id) {
        HangThanhVien hang = hangThanhVienRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng thành viên với ID: " + id));
        return convertToResponse(hang);
    }

    /**
     * Tạo mới hạng thành viên
     */
    @Transactional
    public HangThanhVienResponse createHangThanhVien(HangThanhVienRequest request) {
        // Kiểm tra tên hạng đã tồn tại
        if (hangThanhVienRepository.existsByTenHang(request.getTenHang())) {
            throw new IllegalArgumentException("Tên hạng thành viên đã tồn tại: " + request.getTenHang());
        }

        // Kiểm tra điểm tối thiểu đã tồn tại
        if (hangThanhVienRepository.existsByDiemToiThieu(request.getDiemToiThieu())) {
            throw new IllegalArgumentException("Điểm tối thiểu đã tồn tại: " + request.getDiemToiThieu());
        }

        HangThanhVien hang = new HangThanhVien();
        hang.setTenHang(request.getTenHang());
        hang.setDiemToiThieu(request.getDiemToiThieu());

        HangThanhVien savedHang = hangThanhVienRepository.save(hang);
        return convertToResponse(savedHang);
    }

    /**
     * Cập nhật hạng thành viên
     */
    @Transactional
    public HangThanhVienResponse updateHangThanhVien(Integer id, HangThanhVienRequest request) {
        HangThanhVien hang = hangThanhVienRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng thành viên với ID: " + id));

        // Kiểm tra tên hạng đã tồn tại (trừ chính nó)
        if (!hang.getTenHang().equals(request.getTenHang()) && 
            hangThanhVienRepository.existsByTenHang(request.getTenHang())) {
            throw new IllegalArgumentException("Tên hạng thành viên đã tồn tại: " + request.getTenHang());
        }

        // Kiểm tra điểm tối thiểu đã tồn tại (trừ chính nó)
        if (!hang.getDiemToiThieu().equals(request.getDiemToiThieu()) && 
            hangThanhVienRepository.existsByDiemToiThieu(request.getDiemToiThieu())) {
            throw new IllegalArgumentException("Điểm tối thiểu đã tồn tại: " + request.getDiemToiThieu());
        }

        hang.setTenHang(request.getTenHang());
        hang.setDiemToiThieu(request.getDiemToiThieu());

        HangThanhVien savedHang = hangThanhVienRepository.save(hang);
        return convertToResponse(savedHang);
    }

    /**
     * Xóa hạng thành viên
     */
    @Transactional
    public void deleteHangThanhVien(Integer id) {
        HangThanhVien hang = hangThanhVienRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng thành viên với ID: " + id));

        // Kiểm tra có khách hàng nào đang sử dụng hạng này không
        long count = khachHangRepository.countByHangThanhVien_MaHangThanhVien(id);
        if (count > 0) {
            throw new IllegalStateException("Không thể xóa hạng thành viên này vì đang có " + count + " khách hàng sử dụng");
        }

        hangThanhVienRepository.delete(hang);
    }

    /**
     * Xác định hạng thành viên cho khách hàng dựa trên điểm thưởng
     */
    public HangThanhVien xacDinhHangThanhVien(Integer diemThuong) {
        List<HangThanhVien> danhSachHang = hangThanhVienRepository.findAllByOrderByDiemToiThieuDesc();
        
        for (HangThanhVien hang : danhSachHang) {
            if (diemThuong >= hang.getDiemToiThieu()) {
                return hang;
            }
        }
        
        // Nếu không tìm thấy, trả về hạng thấp nhất
        return hangThanhVienRepository.findFirstByOrderByDiemToiThieuAsc()
                .orElseThrow(() -> new IllegalStateException("Không có hạng thành viên nào trong hệ thống"));
    }

    /**
     * Cập nhật hạng thành viên cho khách hàng
     */
    @Transactional
    public void capNhatHangThanhVien(Integer maKhachHang) {
        KhachHang khachHang = khachHangRepository.findById(maKhachHang)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với ID: " + maKhachHang));

        HangThanhVien hangMoi = xacDinhHangThanhVien(khachHang.getDiemThuong());
        
        if (!hangMoi.getMaHangThanhVien().equals(khachHang.getHangThanhVien().getMaHangThanhVien())) {
            khachHang.setHangThanhVien(hangMoi);
            khachHangRepository.save(khachHang);
        }
    }

    /**
     * Lấy thống kê hạng thành viên
     */
    public Map<String, Object> getThongKeHangThanhVien() {
        List<HangThanhVien> danhSachHang = hangThanhVienRepository.findAllByOrderByDiemToiThieuAsc();
        Map<String, Object> thongKe = new HashMap<>();

        long tongKhachHang = khachHangRepository.count();
        thongKe.put("tongKhachHang", tongKhachHang);

        Map<String, Long> thongKeTheoHang = new HashMap<>();
        for (HangThanhVien hang : danhSachHang) {
            long soLuong = khachHangRepository.countByHangThanhVien_MaHangThanhVien(hang.getMaHangThanhVien());
            thongKeTheoHang.put(hang.getTenHang(), soLuong);
        }
        thongKe.put("thongKeTheoHang", thongKeTheoHang);

        return thongKe;
    }



    /**
     * Chuyển đổi entity sang response DTO
     */
    private HangThanhVienResponse convertToResponse(HangThanhVien hang) {
        long soLuongKhachHang = khachHangRepository.countByHangThanhVien_MaHangThanhVien(hang.getMaHangThanhVien());
        
        return HangThanhVienResponse.builder()
                .maHangThanhVien(hang.getMaHangThanhVien())
                .tenHang(hang.getTenHang())
                .diemToiThieu(hang.getDiemToiThieu())
                .soLuongKhachHang(soLuongKhachHang)
                .moTa(taoMoTaHang(hang))
                .mauSac(HANG_COLORS.getOrDefault(hang.getTenHang(), "#6B7280"))
                .build();
    }

    /**
     * Tạo mô tả cho hạng thành viên
     */
    private String taoMoTaHang(HangThanhVien hang) {
        String tenHang = hang.getTenHang().toLowerCase();
        
        if (tenHang.contains("bronze") || tenHang.contains("đồng")) {
            return "Hạng thành viên cơ bản - Ưu đãi 5%";
        } else if (tenHang.contains("silver") || tenHang.contains("bạc")) {
            return "Hạng thành viên bạc - Ưu đãi 8% + Miễn phí vận chuyển";
        } else if (tenHang.contains("gold") || tenHang.contains("vàng")) {
            return "Hạng thành viên vàng - Ưu đãi 12% + Ưu tiên giao hàng";
        } else if (tenHang.contains("platinum") || tenHang.contains("bạch")) {
            return "Hạng thành viên bạch kim - Ưu đãi 18% + Hỗ trợ 24/7";
        } else if (tenHang.contains("diamond") || tenHang.contains("kim")) {
            return "Hạng thành viên kim cương - Ưu đãi 25% + Tư vấn riêng";
        } else {
            return "Hạng thành viên đặc biệt";
        }
    }

    /**
     * Lấy danh sách hạng thành viên cho VIP Management
     */
    public List<HangThanhVienDto> getAllVipLevels() {
        List<HangThanhVien> hangList = hangThanhVienRepository.findAllByTrangThaiTrueOrderByThuTuAsc();
        return hangList.stream()
                .map(this::convertToVipDto)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi entity sang VIP DTO
     */
    private HangThanhVienDto convertToVipDto(HangThanhVien hang) {
        HangThanhVienDto dto = new HangThanhVienDto();
        dto.setMaHangThanhVien(hang.getMaHangThanhVien());
        dto.setTenHang(hang.getTenHang());
        dto.setDiemToiThieu(hang.getDiemToiThieu());
        dto.setSoTienToiThieu(hang.getSoTienToiThieu());
        dto.setPhanTramGiamGia(hang.getPhanTramGiamGia());
        dto.setMoTa(hang.getMoTa());
        dto.setMauSac(hang.getMauSac());
        dto.setTrangThai(hang.getTrangThai());
        dto.setThuTu(hang.getThuTu());
        dto.setIcon(hang.getIcon());
        
        // Parse JSON ưu đãi
        try {
            if (hang.getUuDai() != null) {
                List<String> uuDaiList = objectMapper.readValue(hang.getUuDai(), 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
                dto.setUuDai(uuDaiList);
            }
        } catch (Exception e) {
            dto.setUuDai(new ArrayList<>());
        }

        // Tính toán thống kê
        long soLuongKhachHang = khachHangRepository.countByHangThanhVien_MaHangThanhVien(hang.getMaHangThanhVien());
        dto.setSoLuongKhachHang(soLuongKhachHang);
        
        // Set level code cho frontend
        dto.setLevel(hang.getTenHang().toLowerCase());
        
        return dto;
    }

    /**
     * Tạo/cập nhật hạng thành viên từ VIP Management
     */
    @Transactional
    public HangThanhVienDto saveVipLevel(HangThanhVienDto dto) {
        HangThanhVien hang;
        
        if (dto.getMaHangThanhVien() != null) {
            hang = hangThanhVienRepository.findById(dto.getMaHangThanhVien())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng thành viên với ID: " + dto.getMaHangThanhVien()));
        } else {
            hang = new HangThanhVien();
        }

        // Cập nhật thông tin
        hang.setTenHang(dto.getTenHang());
        hang.setDiemToiThieu(dto.getDiemToiThieu());
        hang.setSoTienToiThieu(dto.getSoTienToiThieu());
        hang.setPhanTramGiamGia(dto.getPhanTramGiamGia());
        hang.setMoTa(dto.getMoTa());
        hang.setMauSac(dto.getMauSac());
        hang.setTrangThai(dto.getTrangThai() != null ? dto.getTrangThai() : true);
        hang.setThuTu(dto.getThuTu());
        hang.setIcon(dto.getIcon());

        // Chuyển đổi ưu đãi sang JSON
        try {
            if (dto.getUuDai() != null) {
                String uuDaiJson = objectMapper.writeValueAsString(dto.getUuDai());
                hang.setUuDai(uuDaiJson);
            }
        } catch (Exception e) {
            hang.setUuDai("[]");
        }

        HangThanhVien savedHang = hangThanhVienRepository.save(hang);
        return convertToVipDto(savedHang);
    }

    /**
     * Lấy VIP level theo ID
     */
    public HangThanhVienDto getVipLevelById(Integer id) {
        HangThanhVien hang = hangThanhVienRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng thành viên với ID: " + id));
        return convertToVipDto(hang);
    }

    /**
     * Xóa VIP level theo ID
     */
    @Transactional
    public void deleteById(Integer id) {
        HangThanhVien hang = hangThanhVienRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng thành viên với ID: " + id));

        // Kiểm tra có khách hàng nào đang sử dụng hạng này không
        long count = khachHangRepository.countByHangThanhVien_MaHangThanhVien(id);
        if (count > 0) {
            throw new IllegalStateException("Không thể xóa hạng thành viên này vì đang có " + count + " khách hàng sử dụng");
        }

        hangThanhVienRepository.delete(hang);
    }

    /**
     * Lấy danh sách khách hàng VIP với filter
     */
    public List<com.noithat.qlnt.backend.dto.VipKhachHangDto> getVipCustomers(String level, String search) {
        List<KhachHang> khachHangs;
        
        if (level != null && !level.equals("all")) {
            // Filter theo level
            khachHangs = khachHangRepository.findByHangThanhVien_TenHang(level);
        } else {
            // Lấy tất cả
            khachHangs = khachHangRepository.findAll();
        }
        
        return khachHangs.stream()
                .filter(kh -> search == null || search.trim().isEmpty() || 
                        kh.getHoTen().toLowerCase().contains(search.toLowerCase()) ||
                        kh.getEmail().toLowerCase().contains(search.toLowerCase()) ||
                        kh.getSoDienThoai().contains(search))
                .map(this::convertToVipKhachHangDto)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Chuyển đổi KhachHang entity sang VipKhachHangDto
     */
    private com.noithat.qlnt.backend.dto.VipKhachHangDto convertToVipKhachHangDto(KhachHang kh) {
        com.noithat.qlnt.backend.dto.VipKhachHangDto dto = new com.noithat.qlnt.backend.dto.VipKhachHangDto();
        dto.setMaKhachHang(kh.getMaKhachHang());
        dto.setHoTen(kh.getHoTen());
        dto.setEmail(kh.getEmail());
        dto.setSoDienThoai(kh.getSoDienThoai());
        dto.setDiaChi(kh.getDiaChi());
        dto.setDiemThuong(kh.getDiemThuong());
        dto.setTongChiTieu(kh.getTongChiTieu());
        dto.setTongDonHang(kh.getTongDonHang());
        dto.setNgayThamGia(kh.getNgayThamGia());
        dto.setDonHangCuoi(kh.getDonHangCuoi());
        dto.setTrangThaiVip(kh.getTrangThaiVip());
        
        // Thông tin hạng thành viên
        HangThanhVien hang = kh.getHangThanhVien();
        if (hang != null) {
            dto.setTenHang(hang.getTenHang());
            dto.setVipLevel(hang.getTenHang().toLowerCase());
            dto.setMauSac(hang.getMauSac());
            dto.setIcon(hang.getIcon());
            
            // Parse benefits từ JSON
            if (hang.getUuDai() != null && !hang.getUuDai().trim().isEmpty()) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    List<String> benefits = mapper.readValue(hang.getUuDai(), 
                            mapper.getTypeFactory().constructCollectionType(List.class, String.class));
                    dto.setBenefits(benefits);
                } catch (Exception e) {
                    dto.setBenefits(java.util.Arrays.asList(hang.getUuDai()));
                }
            }
        }
        
        return dto;
    }

    /**
     * Xem trước ưu đãi VIP cho khách hàng với giá trị đơn hàng
     */
    public com.noithat.qlnt.backend.dto.response.VipBenefitResponse previewVipBenefits(Integer customerId, BigDecimal orderAmount) {
        KhachHang khachHang = khachHangRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));
        
        HangThanhVien hang = khachHang.getHangThanhVien();
        if (hang == null) {
            throw new RuntimeException("Khách hàng chưa có hạng thành viên");
        }

        // Tính toán các ưu đãi
        BigDecimal giamGiaVip = BigDecimal.ZERO;
        if (hang.getPhanTramGiamGia() != null && hang.getPhanTramGiamGia().compareTo(BigDecimal.ZERO) > 0) {
            giamGiaVip = orderAmount.multiply(hang.getPhanTramGiamGia())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        }

        // Parse benefits
        List<String> benefits = List.of();
        if (hang.getUuDai() != null && !hang.getUuDai().trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                benefits = mapper.readValue(hang.getUuDai(), 
                        mapper.getTypeFactory().constructCollectionType(List.class, String.class));
            } catch (Exception e) {
                benefits = List.of(hang.getUuDai());
            }
        }

        // Tính điểm thưởng VIP
        Integer bonusPoints = 0;
        for (String benefit : benefits) {
            if (benefit.toLowerCase().contains("tích điểm") && benefit.contains("%")) {
                try {
                    String phanTram = benefit.replaceAll("[^0-9.]", "");
                    if (!phanTram.isEmpty()) {
                        BigDecimal bonusRate = new BigDecimal(phanTram);
                        BigDecimal points = orderAmount.multiply(bonusRate)
                                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP)
                                .divide(BigDecimal.valueOf(1000), 0, java.math.RoundingMode.HALF_UP);
                        bonusPoints = points.intValue();
                        break;
                    }
                } catch (Exception e) {
                    // Ignore parsing errors
                }
            }
        }

        boolean mienPhiVanChuyen = benefits.stream().anyMatch(b -> 
            b.toLowerCase().contains("miễn phí vận chuyển") ||
            b.toLowerCase().contains("free shipping")
        );

        boolean uuTienGiaoHang = benefits.stream().anyMatch(b -> 
            b.toLowerCase().contains("ưu tiên giao hàng") ||
            b.toLowerCase().contains("priority")
        );

        return com.noithat.qlnt.backend.dto.response.VipBenefitResponse.builder()
                .tenHangVip(hang.getTenHang())
                .levelCode(hang.getTenHang().toLowerCase())
                .mauSac(hang.getMauSac())
                .icon(hang.getIcon())
                .giamGiaVip(giamGiaVip)
                .phanTramGiamGia(hang.getPhanTramGiamGia())
                .diemVipThuong(bonusPoints)
                .mienPhiVanChuyen(mienPhiVanChuyen)
                .uuTienGiaoHang(uuTienGiaoHang)
                .danhSachUuDai(benefits)
                .tongTietKiem(giamGiaVip) // Có thể tính thêm tiết kiệm vận chuyển
                .moTaTietKiem(String.format("Giảm giá VIP: %,.0f₫", giamGiaVip))
                .build();
    }

    /**
     * Xác định hạng thành viên dựa trên tổng chi tiêu
     */
    public HangThanhVien xacDinhHangTheoChiTieu(BigDecimal tongChiTieu) {
        return hangThanhVienRepository.findTopBySoTienToiThieuLessThanEqualAndTrangThaiTrueOrderBySoTienToiThieuDesc(tongChiTieu)
                .orElse(hangThanhVienRepository.findFirstByTrangThaiTrueOrderByThuTuAsc()
                        .orElseThrow(() -> new RuntimeException("Không có hạng thành viên nào được kích hoạt")));
    }

    /**
     * Khởi tạo dữ liệu hạng thành viên mặc định
     */
    @Transactional
    public void khoiTaoHangThanhVienMacDinh() {
        // Kiểm tra đã có dữ liệu chưa
        if (hangThanhVienRepository.count() > 0) {
            return; // Đã có dữ liệu, không tạo thêm
        }

        try {
            // Tạo hạng Đồng
            HangThanhVien dong = new HangThanhVien();
            dong.setTenHang("Đồng");
            dong.setSoTienToiThieu(BigDecimal.ZERO);
            dong.setPhanTramGiamGia(BigDecimal.valueOf(5));
            dong.setThuTu(1);
            dong.setTrangThai(true);
            dong.setMauSac("#CD7F32");
            dong.setUuDai("[\"Giảm giá 5%\", \"Tích điểm 2%\"]");
            hangThanhVienRepository.save(dong);

            // Tạo hạng Bạc
            HangThanhVien bac = new HangThanhVien();
            bac.setTenHang("Bạc");
            bac.setSoTienToiThieu(BigDecimal.valueOf(5000000));
            bac.setPhanTramGiamGia(BigDecimal.valueOf(8));
            bac.setThuTu(2);
            bac.setTrangThai(true);
            bac.setMauSac("#C0C0C0");
            bac.setUuDai("[\"Giảm giá 8%\", \"Tích điểm 3%\", \"Miễn phí vận chuyển\"]");
            hangThanhVienRepository.save(bac);

            // Tạo hạng Vàng
            HangThanhVien vang = new HangThanhVien();
            vang.setTenHang("Vàng");
            vang.setSoTienToiThieu(BigDecimal.valueOf(15000000));
            vang.setPhanTramGiamGia(BigDecimal.valueOf(12));
            vang.setThuTu(3);
            vang.setTrangThai(true);
            vang.setMauSac("#FFD700");
            vang.setUuDai("[\"Giảm giá 12%\", \"Tích điểm 5%\", \"Miễn phí vận chuyển\", \"Ưu tiên giao hàng\"]");
            hangThanhVienRepository.save(vang);

            // Tạo hạng Bạch Kim
            HangThanhVien bachKim = new HangThanhVien();
            bachKim.setTenHang("Bạch Kim");
            bachKim.setSoTienToiThieu(BigDecimal.valueOf(50000000));
            bachKim.setPhanTramGiamGia(BigDecimal.valueOf(15));
            bachKim.setThuTu(4);
            bachKim.setTrangThai(true);
            bachKim.setMauSac("#E5E4E2");
            bachKim.setUuDai("[\"Giảm giá 15%\", \"Tích điểm 8%\", \"Miễn phí vận chuyển\", \"Ưu tiên giao hàng\", \"Tư vấn riêng\"]");
            hangThanhVienRepository.save(bachKim);

            // Tạo hạng Kim Cương
            HangThanhVien kimCuong = new HangThanhVien();
            kimCuong.setTenHang("Kim Cương");
            kimCuong.setSoTienToiThieu(BigDecimal.valueOf(100000000));
            kimCuong.setPhanTramGiamGia(BigDecimal.valueOf(20));
            kimCuong.setThuTu(5);
            kimCuong.setTrangThai(true);
            kimCuong.setMauSac("#B9F2FF");
            kimCuong.setUuDai("[\"Giảm giá 20%\", \"Tích điểm 10%\", \"Miễn phí vận chuyển\", \"Ưu tiên giao hàng\", \"Tư vấn riêng\", \"Voucher VIP hàng tháng\"]");
            hangThanhVienRepository.save(kimCuong);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi khởi tạo hạng thành viên mặc định: " + e.getMessage(), e);
        }
    }
}