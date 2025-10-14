package com.noithat.qlnt.backend.service;

import com.noithat.qlnt.backend.entity.KiemKeKho;
import com.noithat.qlnt.backend.entity.KiemKeChiTiet;
import java.math.BigDecimal;
import java.util.List;

public interface IQuanLyKiemKeService {
    KiemKeKho createInventoryCheck(String tenKiemKe, String moTa, String nguoiTao);
    boolean addProductToInventoryCheck(Integer maKiemKe, Integer maBienThe);
    boolean startInventoryCheck(Integer maKiemKe);
    boolean updateActualQuantity(Integer maKiemKeChiTiet, Integer soLuongThucTe, String nguoiKiemKe, String lyDoChenhLech);
    boolean completeInventoryCheck(Integer maKiemKe, String nguoiDuyet, boolean applyChanges);
    boolean cancelInventoryCheck(Integer maKiemKe, String lyDo);
    List<KiemKeKho> getInventoryChecksByStatus(KiemKeKho.TrangThaiKiemKe trangThai);
    List<KiemKeKho> getActiveInventoryChecks();
    List<KiemKeChiTiet> getInventoryCheckDetails(Integer maKiemKe);
    List<KiemKeChiTiet> getProductsWithDifferences(Integer maKiemKe);
    List<KiemKeChiTiet> getShortageProducts(Integer maKiemKe);
    List<KiemKeChiTiet> getSurplusProducts(Integer maKiemKe);
    Object[] getInventoryCheckSummary(Integer maKiemKe);
    BigDecimal getTotalDifferenceValue(Integer maKiemKe);
    List<Object[]> getInventoryCheckStatistics();
    KiemKeKho createFullInventoryCheck(String tenKiemKe, String nguoiTao);
}
