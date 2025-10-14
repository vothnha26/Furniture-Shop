package com.noithat.qlnt.backend.service.impl;

import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.LichSuTonKho;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.repository.LichSuTonKhoRepository;
import com.noithat.qlnt.backend.service.IQuanLyTonKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class QuanLyTonKhoServiceImpl implements IQuanLyTonKhoService {

    private static final Logger logger = LoggerFactory.getLogger(QuanLyTonKhoServiceImpl.class);

    @Autowired
    private BienTheSanPhamRepository bienTheSanPhamRepository;

    @Autowired
    private LichSuTonKhoRepository lichSuTonKhoRepository;

    @Override
    public boolean importStock(Integer maBienThe, Integer quantity, String nguoiThucHien, String lyDo) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }

            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();

            bienThe.updateStock(quantity);
            bienTheSanPhamRepository.save(bienThe);

            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, soLuongTruoc, quantity, bienThe.getSoLuongTon(),
                "NHAP_KHO", null, lyDo, nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean exportStock(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien, String lyDo) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }

            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();

            if (soLuongTruoc < quantity) {
                return false;
            }

            bienThe.updateStock(-quantity);
            bienTheSanPhamRepository.save(bienThe);

            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, soLuongTruoc, -quantity, bienThe.getSoLuongTon(),
                "XUAT_KHO", maThamChieu, lyDo, nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean reserveProduct(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }

            BienTheSanPham bienThe = optionalBienThe.get();

            if (!bienThe.canReserve(quantity)) {
                return false;
            }

            bienThe.reserveStock(quantity);
            bienTheSanPhamRepository.save(bienThe);

            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, bienThe.getSoLuongTon(), 0, bienThe.getSoLuongTon(),
                "DAT_TRUOC", maThamChieu,
                "Đặt trước " + quantity + " sản phẩm", nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean releaseReservation(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }

            BienTheSanPham bienThe = optionalBienThe.get();

            if (bienThe.getSoLuongDatTruoc() < quantity) {
                return false;
            }

            bienThe.releaseStock(quantity);
            bienTheSanPhamRepository.save(bienThe);

            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, bienThe.getSoLuongTon(), 0, bienThe.getSoLuongTon(),
                "HUY_DAT_TRUOC", maThamChieu,
                "Hủy đặt trước " + quantity + " sản phẩm", nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean confirmSale(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }

            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();

            if (bienThe.getSoLuongTon() < quantity) {
                return false;
            }

            bienThe.confirmSale(quantity);
            bienTheSanPhamRepository.save(bienThe);

            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, soLuongTruoc, -quantity, bienThe.getSoLuongTon(),
                "BAN_HANG", maThamChieu,
                "Bán " + quantity + " sản phẩm", nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean returnProduct(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien, String lyDo) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }

            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();

            bienThe.updateStock(quantity);
            bienTheSanPhamRepository.save(bienThe);

            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, soLuongTruoc, quantity, bienThe.getSoLuongTon(),
                "TRA_HANG", maThamChieu, lyDo, nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean adjustStock(Integer maBienThe, Integer newQuantity, String lyDo, String nguoiThucHien) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }

            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();
            Integer chenhLech = newQuantity - soLuongTruoc;

            bienThe.setSoLuongTon(newQuantity);
            bienThe.setNgayCapNhatKho(LocalDateTime.now());
            bienTheSanPhamRepository.save(bienThe);

            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, soLuongTruoc, chenhLech, newQuantity,
                "DIEU_CHINH", null, lyDo, nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<BienTheSanPham> getLowStockProducts() {
        return bienTheSanPhamRepository.findLowStockProducts();
    }

    @Override
    public List<BienTheSanPham> getOutOfStockProducts() {
        return bienTheSanPhamRepository.findOutOfStockProducts();
    }

    @Override
    public List<LichSuTonKho> getStockHistory(Integer maBienThe) {
        return lichSuTonKhoRepository.findByBienTheSanPhamOrderByThoiGianThucHienDesc(maBienThe);
    }

    @Override
    public boolean isAvailableForSale(Integer maBienThe, Integer quantity) {
        Boolean result = bienTheSanPhamRepository.isAvailableForSale(maBienThe, quantity);
        return result != null && result;
    }

    @Override
    public Integer getAvailableQuantity(Integer maBienThe) {
        return bienTheSanPhamRepository.getAvailableQuantity(maBienThe);
    }

    @Override
    public Double getTotalStockValue() {
        Double value = bienTheSanPhamRepository.getTotalStockValue();
        return value != null ? value : 0.0;
    }

    @Override
    public List<Object[]> getStockSummaryByProduct() {
        return bienTheSanPhamRepository.getStockSummaryByProduct();
    }

    @Override
    public List<Object[]> getStockSummaryByCategory() {
        return bienTheSanPhamRepository.getStockSummaryByCategory();
    }

    @Override
    public ResponseEntity<Map<String, Object>> getCurrentStockInfo(Integer maBienThe) {
        Map<String, Object> response = new HashMap<>();

        try {
            logger.info("Lấy thông tin tồn kho cho biến thể: {}", maBienThe);

            Optional<BienTheSanPham> bienTheOpt = bienTheSanPhamRepository.findById(maBienThe);
            if (!bienTheOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Không tìm thấy biến thể sản phẩm");
                return ResponseEntity.badRequest().body(response);
            }

            BienTheSanPham bienThe = bienTheOpt.get();

            Map<String, Object> stockInfo = new HashMap<>();
            stockInfo.put("maBienThe", bienThe.getMaBienThe());
            stockInfo.put("tenSanPham", bienThe.getSanPham().getTenSanPham());
            stockInfo.put("sku", bienThe.getSku());
            stockInfo.put("soLuongTon", bienThe.getSoLuongTon());
            stockInfo.put("soLuongDatTruoc", bienThe.getSoLuongDatTruoc());
            stockInfo.put("soLuongCoSan", bienThe.getSoLuongCoSan());
            stockInfo.put("giaBan", bienThe.getGiaBan());
            stockInfo.put("viTriKho", bienThe.getViTriKho());
            stockInfo.put("trangThaiKho", bienThe.getTrangThaiKho());

            response.put("success", true);
            response.put("message", "Lấy thông tin tồn kho thành công");
            response.put("data", stockInfo);

            logger.info("Thông tin tồn kho: {}", stockInfo);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin tồn kho: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
