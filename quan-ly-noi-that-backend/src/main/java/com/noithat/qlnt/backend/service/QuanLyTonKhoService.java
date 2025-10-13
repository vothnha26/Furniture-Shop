package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.entity.BienTheSanPham;
import com.noithat.qlnt.backend.entity.LichSuTonKho;
import com.noithat.qlnt.backend.repository.BienTheSanPhamRepository;
import com.noithat.qlnt.backend.repository.LichSuTonKhoRepository;
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
public class QuanLyTonKhoService {
    
    private static final Logger logger = LoggerFactory.getLogger(QuanLyTonKhoService.class);
    
    @Autowired
    private BienTheSanPhamRepository bienTheSanPhamRepository;
    
    @Autowired
    private LichSuTonKhoRepository lichSuTonKhoRepository;
    
    // =================== STOCK OPERATIONS ===================
    
    /**
     * Nhập hàng vào kho
     */
    public boolean importStock(Integer maBienThe, Integer quantity, String nguoiThucHien, String lyDo) {
        try {
            System.out.println("DEBUG: importStock called with maBienThe=" + maBienThe + ", quantity=" + quantity);
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                System.out.println("DEBUG: BienTheSanPham not found with id=" + maBienThe);
                return false;
            }
            
            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();
            
            // Cập nhật số lượng
            bienThe.updateStock(quantity);
            bienTheSanPhamRepository.save(bienThe);
            
            // Ghi lịch sử
            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, soLuongTruoc, quantity, bienThe.getSoLuongTon(),
                "NHAP_KHO", null, lyDo, nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);
            
            System.out.println("DEBUG: importStock completed successfully");
            return true;
        } catch (Exception e) {
            System.out.println("DEBUG: importStock failed with exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Xuất hàng khỏi kho
     */
    public boolean exportStock(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien, String lyDo) {
        try {
            System.out.println("DEBUG: exportStock called with maBienThe=" + maBienThe + ", quantity=" + quantity);
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                System.out.println("DEBUG: BienTheSanPham not found with id=" + maBienThe);
                return false;
            }
            
            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();
            System.out.println("DEBUG: Current stock=" + soLuongTruoc + ", requested quantity=" + quantity);
            
            // Kiểm tra đủ hàng để xuất
            if (soLuongTruoc < quantity) {
                System.out.println("DEBUG: Not enough stock. Current=" + soLuongTruoc + ", requested=" + quantity);
                return false;
            }
            
            // Cập nhật số lượng (xuất = trừ)
            bienThe.updateStock(-quantity);
            bienTheSanPhamRepository.save(bienThe);
            
            // Ghi lịch sử
            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, soLuongTruoc, -quantity, bienThe.getSoLuongTon(),
                "XUAT_KHO", maThamChieu, lyDo, nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);
            
            System.out.println("DEBUG: exportStock completed successfully. New stock=" + bienThe.getSoLuongTon());
            return true;
        } catch (Exception e) {
            System.out.println("DEBUG: exportStock failed with exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Đặt trước sản phẩm
     */
    public boolean reserveProduct(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }
            
            BienTheSanPham bienThe = optionalBienThe.get();
            
            // Kiểm tra đủ hàng để đặt trước
            if (!bienThe.canReserve(quantity)) {
                return false;
            }
            
            // Đặt trước
            bienThe.reserveStock(quantity);
            bienTheSanPhamRepository.save(bienThe);
            
            // Ghi lịch sử
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
    
    /**
     * Hủy đặt trước
     */
    public boolean releaseReservation(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }
            
            BienTheSanPham bienThe = optionalBienThe.get();
            
            // Kiểm tra có đủ số lượng đặt trước để hủy
            if (bienThe.getSoLuongDatTruoc() < quantity) {
                return false;
            }
            
            // Hủy đặt trước
            bienThe.releaseStock(quantity);
            bienTheSanPhamRepository.save(bienThe);
            
            // Ghi lịch sử
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
    
    /**
     * Xác nhận bán hàng (trừ cả tồn kho và đặt trước)
     */
    public boolean confirmSale(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien) {
        try {
            System.out.println("DEBUG: confirmSale called with maBienThe=" + maBienThe + ", quantity=" + quantity);
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                System.out.println("DEBUG: BienTheSanPham not found with id=" + maBienThe);
                return false;
            }
            
            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();
            Integer soLuongDatTruoc = bienThe.getSoLuongDatTruoc() != null ? bienThe.getSoLuongDatTruoc() : 0;
            
            System.out.println("DEBUG: soLuongTon=" + soLuongTruoc + ", soLuongDatTruoc=" + soLuongDatTruoc + ", quantity=" + quantity);
            
            // Kiểm tra có thể bán không - Sửa lại logic: chỉ cần đủ tồn kho
            if (bienThe.getSoLuongTon() < quantity) {
                System.out.println("DEBUG: Không đủ tồn kho để bán");
                return false;
            }
            
            // Xác nhận bán hàng
            bienThe.confirmSale(quantity);
            
            bienTheSanPhamRepository.save(bienThe);
            
            // Ghi lịch sử
            LichSuTonKho lichSu = new LichSuTonKho(
                bienThe, soLuongTruoc, -quantity, bienThe.getSoLuongTon(),
                "BAN_HANG", maThamChieu, 
                "Bán " + quantity + " sản phẩm", nguoiThucHien
            );
            lichSuTonKhoRepository.save(lichSu);
            
            System.out.println("DEBUG: confirmSale completed successfully");
            return true;
        } catch (Exception e) {
            System.out.println("DEBUG: confirmSale failed with exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Trả hàng
     */
    public boolean returnProduct(Integer maBienThe, Integer quantity, String maThamChieu, String nguoiThucHien, String lyDo) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }
            
            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();
            
            // Trả hàng = tăng tồn kho
            bienThe.updateStock(quantity);
            bienTheSanPhamRepository.save(bienThe);
            
            // Ghi lịch sử
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
    
    /**
     * Điều chỉnh tồn kho (kiểm kê)
     */
    public boolean adjustStock(Integer maBienThe, Integer newQuantity, String lyDo, String nguoiThucHien) {
        try {
            Optional<BienTheSanPham> optionalBienThe = bienTheSanPhamRepository.findById(maBienThe);
            if (optionalBienThe.isEmpty()) {
                return false;
            }
            
            BienTheSanPham bienThe = optionalBienThe.get();
            Integer soLuongTruoc = bienThe.getSoLuongTon();
            Integer chenhLech = newQuantity - soLuongTruoc;
            
            // Điều chỉnh tồn kho
            bienThe.setSoLuongTon(newQuantity);
            bienThe.setNgayCapNhatKho(LocalDateTime.now());
            bienTheSanPhamRepository.save(bienThe);
            
            // Ghi lịch sử
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
    
    // =================== QUERY OPERATIONS ===================
    
    /**
     * Lấy danh sách sản phẩm sắp hết hàng
     */
    public List<BienTheSanPham> getLowStockProducts() {
        return bienTheSanPhamRepository.findLowStockProducts();
    }
    
    /**
     * Lấy danh sách sản phẩm hết hàng
     */
    public List<BienTheSanPham> getOutOfStockProducts() {
        return bienTheSanPhamRepository.findOutOfStockProducts();
    }
    
    /**
     * Lấy lịch sử tồn kho của một biến thể
     */
    public List<LichSuTonKho> getStockHistory(Integer maBienThe) {
        return lichSuTonKhoRepository.findByBienTheSanPhamOrderByThoiGianThucHienDesc(maBienThe);
    }
    
    /**
     * Kiểm tra khả năng bán
     */
    public boolean isAvailableForSale(Integer maBienThe, Integer quantity) {
        Boolean result = bienTheSanPhamRepository.isAvailableForSale(maBienThe, quantity);
        return result != null && result;
    }
    
    /**
     * Lấy số lượng có thể bán
     */
    public Integer getAvailableQuantity(Integer maBienThe) {
        return bienTheSanPhamRepository.getAvailableQuantity(maBienThe);
    }
    
    /**
     * Tính tổng giá trị tồn kho
     */
    public Double getTotalStockValue() {
        Double value = bienTheSanPhamRepository.getTotalStockValue();
        return value != null ? value : 0.0;
    }
    
    /**
     * Lấy thống kê tồn kho theo sản phẩm
     */
    public List<Object[]> getStockSummaryByProduct() {
        return bienTheSanPhamRepository.getStockSummaryByProduct();
    }
    
    /**
     * Lấy thống kê tồn kho theo danh mục
     */
    public List<Object[]> getStockSummaryByCategory() {
        return bienTheSanPhamRepository.getStockSummaryByCategory();
    }
    
    /**
     * Lấy thông tin tồn kho hiện tại của một biến thể sản phẩm
     */
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
            
            // Tạo thông tin chi tiết
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