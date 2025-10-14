package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.TaoHoaDonRequest;
import com.noithat.qlnt.backend.dto.request.UpdateHoaDonRequest;
import com.noithat.qlnt.backend.dto.response.HoaDonChiTietResponse;
import com.noithat.qlnt.backend.dto.response.HoaDonResponse;
import com.noithat.qlnt.backend.dto.response.ThongKeHoaDonResponse;
import com.noithat.qlnt.backend.entity.DonHang;
import com.noithat.qlnt.backend.entity.HoaDon;
import com.noithat.qlnt.backend.entity.NhanVien;
import com.noithat.qlnt.backend.repository.DonHangRepository;
import com.noithat.qlnt.backend.repository.HoaDonRepository;
import com.noithat.qlnt.backend.repository.NhanVienRepository;
import com.noithat.qlnt.backend.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HoaDonServiceImpl implements HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final DonHangRepository donHangRepository;
    private final NhanVienRepository nhanVienRepository;

    @Override
    public ThongKeHoaDonResponse getThongKe() {
        long tongHoaDon = hoaDonRepository.count();
        BigDecimal tongDoanhThu = hoaDonRepository.findAll().stream()
                .map(HoaDon::getTongTienThanhToan)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ThongKeHoaDonResponse response = new ThongKeHoaDonResponse();
        response.setTongHoaDon(tongHoaDon);
        response.setDaThanhToan(tongHoaDon); // Tạm thời giả sử tất cả đã thanh toán
        response.setChoThanhToan(0L);
        response.setTongDoanhThu(tongDoanhThu);
        
        return response;
    }

    @Override
    public List<HoaDonResponse> getAllHoaDon(String search) {
        List<HoaDon> hoaDonList;
        
        if (search != null && !search.trim().isEmpty()) {
            hoaDonList = hoaDonRepository.findAll().stream()
                    .filter(hd -> hd.getSoHoaDon() != null && 
                                  hd.getSoHoaDon().toLowerCase().contains(search.toLowerCase()))
                    .collect(Collectors.toList());
        } else {
            hoaDonList = hoaDonRepository.findAll();
        }
        
        return hoaDonList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HoaDonChiTietResponse getHoaDonById(Integer id) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với ID: " + id));
        
        return mapToChiTietResponse(hoaDon);
    }

    @Override
    @Transactional
    public HoaDonResponse taoHoaDon(TaoHoaDonRequest request) {
        DonHang donHang = donHangRepository.findById(request.getMaDonHang())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + request.getMaDonHang()));

        // Kiểm tra xem đơn hàng đã có hóa đơn chưa
        if (hoaDonRepository.findByDonHang(donHang).isPresent()) {
            throw new RuntimeException("Đơn hàng này đã có hóa đơn");
        }

        NhanVien nhanVien = nhanVienRepository.findById(request.getMaNhanVienXuat())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với ID: " + request.getMaNhanVienXuat()));

        HoaDon hoaDon = new HoaDon();
        hoaDon.setDonHang(donHang);
        hoaDon.setSoHoaDon(generateSoHoaDon());
        hoaDon.setNgayXuat(LocalDateTime.now());
        hoaDon.setNhanVienXuat(nhanVien);
        hoaDon.setTongTienThanhToan(donHang.getThanhTien());

        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);
        return mapToResponse(savedHoaDon);
    }

    @Override
    @Transactional
    public HoaDonResponse updateHoaDon(Integer id, UpdateHoaDonRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với ID: " + id));

        // Cập nhật nhân viên xuất hóa đơn
        if (request.getMaNhanVienXuat() != null) {
            NhanVien nhanVien = nhanVienRepository.findById(request.getMaNhanVienXuat())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với ID: " + request.getMaNhanVienXuat()));
            hoaDon.setNhanVienXuat(nhanVien);
        }

        HoaDon updatedHoaDon = hoaDonRepository.save(hoaDon);
        return mapToResponse(updatedHoaDon);
    }

    @Override
    @Transactional
    public void deleteHoaDon(Integer id) {
        if (!hoaDonRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy hóa đơn với ID: " + id);
        }
        hoaDonRepository.deleteById(id);
    }

    @Override
    public byte[] generateInvoicePdfForDonHang(Integer maDonHang) {
        // TODO: Implement PDF generation logic
        throw new UnsupportedOperationException("Chức năng tạo PDF chưa được triển khai");
    }

    // Helper methods
    private HoaDonResponse mapToResponse(HoaDon hoaDon) {
        HoaDonResponse response = new HoaDonResponse();
        response.setMaHoaDon(hoaDon.getMaHoaDon());
        response.setSoHoaDon(hoaDon.getSoHoaDon());
        response.setNgayXuat(hoaDon.getNgayXuat());
        response.setTongTien(hoaDon.getTongTienThanhToan());
        response.setTrangThaiThanhToan("Đã thanh toán"); // Tạm thời mặc định
        
        if (hoaDon.getDonHang() != null) {
            response.setMaDonHang(String.valueOf(hoaDon.getDonHang().getMaDonHang()));
            if (hoaDon.getDonHang().getKhachHang() != null) {
                response.setTenKhachHang(hoaDon.getDonHang().getKhachHang().getHoTen());
            }
        }
        
        if (hoaDon.getNhanVienXuat() != null) {
            response.setNhanVienXuat(hoaDon.getNhanVienXuat().getHoTen());
        }
        
        return response;
    }

    private HoaDonChiTietResponse mapToChiTietResponse(HoaDon hoaDon) {
        HoaDonChiTietResponse response = new HoaDonChiTietResponse();
        response.setSoHoaDon(hoaDon.getSoHoaDon());
        response.setNgayXuat(hoaDon.getNgayXuat());
        response.setTongTienThanhToan(hoaDon.getTongTienThanhToan());
        response.setTrangThaiThanhToan("Đã thanh toán"); // Tạm thời mặc định
        
        if (hoaDon.getDonHang() != null) {
            response.setMaDonHang(String.valueOf(hoaDon.getDonHang().getMaDonHang()));
            response.setNgayDat(hoaDon.getDonHang().getNgayDatHang());
            
            if (hoaDon.getDonHang().getKhachHang() != null) {
                response.setTenKhachHang(hoaDon.getDonHang().getKhachHang().getHoTen());
            }
        }
        
        if (hoaDon.getNhanVienXuat() != null) {
            response.setNhanVienXuat(hoaDon.getNhanVienXuat().getHoTen());
        }
        
        return response;
    }

    private String generateSoHoaDon() {
        long count = hoaDonRepository.count();
        return String.format("HD%06d", count + 1);
    }
}
