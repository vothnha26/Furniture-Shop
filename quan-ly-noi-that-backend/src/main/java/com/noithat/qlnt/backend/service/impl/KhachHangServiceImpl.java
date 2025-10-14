package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.dto.request.KhachHangCreationRequest;
import com.noithat.qlnt.backend.entity.KhachHang;
import com.noithat.qlnt.backend.entity.HangThanhVien;
import com.noithat.qlnt.backend.entity.TaiKhoan;
import com.noithat.qlnt.backend.entity.LichSuDiemThuong;
import com.noithat.qlnt.backend.repository.KhachHangRepository;
import com.noithat.qlnt.backend.repository.HangThanhVienRepository;
import com.noithat.qlnt.backend.repository.TaiKhoanRepository;
import com.noithat.qlnt.backend.repository.LichSuDiemThuongRepository;
import com.noithat.qlnt.backend.repository.DonHangRepository;
import com.noithat.qlnt.backend.exception.ResourceNotFoundException;
import com.noithat.qlnt.backend.service.IKhachHangService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class KhachHangServiceImpl implements IKhachHangService {

    private final KhachHangRepository khachHangRepository;
    private final HangThanhVienRepository hangThanhVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final LichSuDiemThuongRepository lichSuDiemThuongRepository;
    private final DonHangRepository donHangRepository;

    public KhachHangServiceImpl(KhachHangRepository khachHangRepository,
                               HangThanhVienRepository hangThanhVienRepository,
                               TaiKhoanRepository taiKhoanRepository,
                               LichSuDiemThuongRepository lichSuDiemThuongRepository,
                               DonHangRepository donHangRepository) {
        this.khachHangRepository = khachHangRepository;
        this.hangThanhVienRepository = hangThanhVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.lichSuDiemThuongRepository = lichSuDiemThuongRepository;
        this.donHangRepository = donHangRepository;
    }

    @Override
    public List<KhachHang> getAll() {
        return khachHangRepository.findAll();
    }

    @Override
    @Transactional
    public KhachHang create(KhachHangCreationRequest request) {
        KhachHang khachHang = new KhachHang();
        khachHang.setHoTen(request.getHoTen());
        khachHang.setEmail(request.getEmail());
        khachHang.setSoDienThoai(request.getSoDienThoai());
        khachHang.setDiaChi(request.getDiaChi());
        khachHang.setDiemThuong(0);

        HangThanhVien hangThanhVien = hangThanhVienRepository.findById(request.getMaHangThanhVien())
                .orElseThrow(() -> new ResourceNotFoundException("Hạng thành viên không tồn tại: " + request.getMaHangThanhVien()));
        khachHang.setHangThanhVien(hangThanhVien);

        if (request.getMaTaiKhoan() != null) {
            TaiKhoan taiKhoan = taiKhoanRepository.findById(request.getMaTaiKhoan())
                    .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại: " + request.getMaTaiKhoan()));
            khachHang.setTaiKhoan(taiKhoan);
        }

        return khachHangRepository.save(khachHang);
    }

    @Override
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

    @Override
    @Transactional
    public void delete(Integer maKhachHang) {
        KhachHang existing = getKhachHangProfile(maKhachHang);
        
        // Kiểm tra xem khách hàng có đơn hàng nào không
        long orderCount = donHangRepository.countByKhachHang_MaKhachHang(maKhachHang);
        if (orderCount > 0) {
            throw new IllegalStateException(
                "Không thể xóa khách hàng này vì đã có " + orderCount + " đơn hàng");
        }
        
        khachHangRepository.delete(existing);
    }

    @Override
    public KhachHang getKhachHangProfile(Integer maKhachHang) {
        return khachHangRepository.findById(maKhachHang)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng ID: " + maKhachHang + " không tồn tại."));
    }

    @Override
    @Transactional
    public KhachHang tichDiemVaCapNhatHang(Integer maKhachHang, Integer diemThayDoi) {
        KhachHang khachHang = getKhachHangProfile(maKhachHang);
        if (diemThayDoi <= 0) {
            throw new IllegalArgumentException("Điểm thay đổi phải lớn hơn 0.");
        }

        khachHang.setDiemThuong(khachHang.getDiemThuong() + diemThayDoi);

        List<HangThanhVien> allHangs = hangThanhVienRepository.findAllByOrderByDiemToiThieuAsc();
        HangThanhVien hangCu = khachHang.getHangThanhVien();
        HangThanhVien hangMoi = hangCu;

        for (int i = allHangs.size() - 1; i >= 0; i--) {
            HangThanhVien currentHang = allHangs.get(i);
            if (khachHang.getDiemThuong() >= currentHang.getDiemToiThieu()) {
                hangMoi = currentHang;
                break;
            }
        }

        LichSuDiemThuong lsTichDiem = new LichSuDiemThuong();
        lsTichDiem.setKhachHang(khachHang);
        lsTichDiem.setDiemThayDoi(diemThayDoi);
        lsTichDiem.setLyDo("Tích điểm thưởng: +" + diemThayDoi + " điểm");
        lichSuDiemThuongRepository.save(lsTichDiem);

        if (!hangMoi.equals(hangCu)) {
            khachHang.setHangThanhVien(hangMoi);

            LichSuDiemThuong lsNangHang = new LichSuDiemThuong();
            lsNangHang.setKhachHang(khachHang);
            lsNangHang.setDiemThayDoi(0);
            lsNangHang.setLyDo(String.format("Nâng hạng từ %s lên %s (đạt %d điểm)",
                    hangCu.getTenHang(),
                    hangMoi.getTenHang(),
                    khachHang.getDiemThuong()));
            lichSuDiemThuongRepository.save(lsNangHang);
        }

        return khachHangRepository.save(khachHang);
    }
}
