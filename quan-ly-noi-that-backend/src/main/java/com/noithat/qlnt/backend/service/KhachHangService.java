package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.dto.request.KhachHangCreationRequest;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.entity.HangThanhVien;
import com.noithat.qlnt.backend.entity.TaiKhoan;
import com.noithat.qlnt.backend.repository.KhachHangRepository;
import com.noithat.qlnt.backend.repository.HangThanhVienRepository;
import com.noithat.qlnt.backend.repository.TaiKhoanRepository;
import com.noithat.qlnt.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class KhachHangService {

    private final KhachHangRepository khachHangRepository;
    private final HangThanhVienRepository hangThanhVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    public KhachHangService(KhachHangRepository khachHangRepository, 
                           HangThanhVienRepository hangThanhVienRepository,
                           TaiKhoanRepository taiKhoanRepository) {
        this.khachHangRepository = khachHangRepository;
        this.hangThanhVienRepository = hangThanhVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    public List<KhachHang> getAll() {
        return khachHangRepository.findAll();
    }

    @Transactional
    public KhachHang create(KhachHangCreationRequest request) {
        KhachHang khachHang = new KhachHang();
        khachHang.setHoTen(request.getHoTen());
        khachHang.setEmail(request.getEmail());
        khachHang.setSoDienThoai(request.getSoDienThoai());
        khachHang.setDiaChi(request.getDiaChi());
        khachHang.setDiemThuong(0);

        // Set HangThanhVien
        HangThanhVien hangThanhVien = hangThanhVienRepository.findById(request.getMaHangThanhVien())
            .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên không tồn tại: " + request.getMaHangThanhVien()));
        khachHang.setHangThanhVien(hangThanhVien);

        // Set TaiKhoan if provided
        if (request.getMaTaiKhoan() != null) {
            TaiKhoan taiKhoan = taiKhoanRepository.findById(request.getMaTaiKhoan())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại: " + request.getMaTaiKhoan()));
            khachHang.setTaiKhoan(taiKhoan);
        }

        return khachHangRepository.save(khachHang);
    }

    @Transactional
    public KhachHang update(Integer maKhachHang, KhachHang request) {
        KhachHang existing = getKhachHangProfile(maKhachHang);
        existing.setHoTen(request.getHoTen());
        existing.setEmail(request.getEmail());
        existing.setSoDienThoai(request.getSoDienThoai());
        existing.setDiemThuong(request.getDiemThuong());
        if (request.getHangThanhVien() != null) {
            Integer hangId = request.getHangThanhVien().getMaHangThanhVien();
            var hang = hangThanhVienRepository.findById(hangId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên ID: " + hangId + " không tồn tại."));
            existing.setHangThanhVien(hang);
        }
        return khachHangRepository.save(existing);
    }

    @Transactional
    public void delete(Integer maKhachHang) {
        KhachHang existing = getKhachHangProfile(maKhachHang);
        khachHangRepository.delete(existing);
    }

    public KhachHang getKhachHangProfile(Integer maKhachHang) {
        return khachHangRepository.findById(maKhachHang)
               .orElseThrow(() -> new ResourceNotFoundException("Khách hàng ID: " + maKhachHang + " không tồn tại."));
    }

    @Transactional
    public KhachHang tichDiemVaCapNhatHang(Integer maKhachHang, Integer diemThayDoi) {
        KhachHang khachHang = getKhachHangProfile(maKhachHang);
        if (diemThayDoi <= 0) {
            throw new IllegalArgumentException("Điểm thay đổi phải lớn hơn 0.");
        }

        khachHang.setDiemThuong(khachHang.getDiemThuong() + diemThayDoi);

        // Logic tự động nâng hạng
        List<HangThanhVien> allHangs = hangThanhVienRepository.findAllByOrderByDiemToiThieuAsc();
        HangThanhVien hangMoi = khachHang.getHangThanhVien();

        for (int i = allHangs.size() - 1; i >= 0; i--) {
            HangThanhVien currentHang = allHangs.get(i);
            if (khachHang.getDiemThuong() >= currentHang.getDiemToiThieu()) {
                hangMoi = currentHang;
                break;
            }
        }

        if (!hangMoi.equals(khachHang.getHangThanhVien())) {
            khachHang.setHangThanhVien(hangMoi);
            
        }

        return khachHangRepository.save(khachHang);
    }

    private void validateHangThanhVien(KhachHang khachHang) {
        if (khachHang.getHangThanhVien() == null || khachHang.getHangThanhVien().getMaHangThanhVien() == null) {
            throw new IllegalArgumentException("Cần cung cấp hạng thành viên hợp lệ.");
        }
        Integer id = khachHang.getHangThanhVien().getMaHangThanhVien();
        hangThanhVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên ID: " + id + " không tồn tại."));
    }
}