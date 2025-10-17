-- =============================================
-- Description: Phân tích và thống kê về các hạng khách hàng VIP.
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetVipCustomerAnalysis
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        htv.ten_hang AS TenHangThanhVien,
        COUNT(kh.ma_khach_hang) AS SoLuongKhachHang,
        COALESCE(SUM(kh.tong_chi_tieu), 0) AS TongChiTieu,
        COALESCE(AVG(kh.tong_chi_tieu), 0) AS ChiTieuTrungBinh
    FROM
        dbo.hang_thanh_vien htv
    LEFT JOIN
        dbo.khach_hang kh ON htv.ma_hang_thanh_vien = kh.ma_hang_thanh_vien
    -- Giả sử hạng thành viên > 1 là VIP
    WHERE htv.ma_hang_thanh_vien > 1
    GROUP BY
        htv.ten_hang
    ORDER BY
        SoLuongKhachHang DESC;
END
GO