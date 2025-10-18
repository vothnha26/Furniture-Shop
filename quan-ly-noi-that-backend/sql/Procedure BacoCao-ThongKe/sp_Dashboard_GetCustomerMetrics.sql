-- =============================================
-- Description: Lấy các số liệu thống kê về khách hàng.
-- =============================================
CREATE PROCEDURE sp_Dashboard_GetCustomerMetrics
AS
BEGIN
    SET NOCOUNT ON;

    -- Số khách hàng mới (đăng ký trong 30 ngày gần nhất)
    DECLARE @NewCustomers INT = (
        SELECT COUNT(maKhachHang)
        FROM dbo.KhachHang
        WHERE ngayThamGia >= DATEADD(day, -30, GETDATE())
    );

    -- Số khách hàng VIP (giả sử hạng thành viên > 1 là VIP)
    DECLARE @VipCustomers INT = (
        SELECT COUNT(maKhachHang)
        FROM dbo.KhachHang
        WHERE ma_hang_thanh_vien > 1
    );

    -- Trả về kết quả
    SELECT
        @NewCustomers AS newCustomers,
        @VipCustomers AS vipCustomers,
        '85%' AS retentionRate,  -- Placeholder
        '4.8/5' AS satisfaction; -- Placeholder
END
GO